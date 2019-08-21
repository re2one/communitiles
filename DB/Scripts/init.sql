-- CREATING A DB FOR USER AUTHENTICATION
CREATE DATABASE IF NOT EXISTS AuthenticationDB;

USE AuthenticationDB;

-- CREATION OF THE NECESSARY TABLES
CREATE TABLE IF NOT EXISTS User (
	UserId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	Username VARCHAR(255) UNIQUE NOT NULL,
	EmailAddress VARCHAR(255) UNIQUE NOT NULL,
	Password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Image (
	ImageId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	Image VARCHAR(255) NOT NULL,
	Path VARCHAR(255) NOT NULL,
	Level INT NOT NULL,
	ClassLabel VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Game (
	GameId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	PlayerOne INT NOT NULL,
	PlayerOneRole VARCHAR(255) NOT NULL,
	PlayerTwo INT NOT NULL,
	PlayerTwoRole VARCHAR(255) NOT NULL,
	ImageId INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Score (
	GameId INT NOT NULL,
	Score FLOAT NOT NULL
);

CREATE TABLE IF NOT EXISTS GameSession (
	SessionId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	UserId INT NOT NULL
);

CREATE TABLE IF NOT EXISTS SessionStart (
	SessionId INT NOT NULL,
	LoginTime DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS SessionEnd (
	SessionId INT NOT NULL,
	LogoutTime DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS Actions (
	UserId INT,
	Player VARCHAR(255) NOT NULL,
	InputTime DATETIME NOT NULL,
	GameTransaction VARCHAR(255) NOT NULL,
	GameTransactionValue VARCHAR(255),
	GameId INT NOT NULL
);

CREATE TABLE IF NOT EXISTS Segment (
	SegmentId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	ImageId VARCHAR(255) NOT NULL,
	Image VARCHAR(255) NOT NULL,
	Segment VARCHAR(255) NOT NULL
);

-- CREATION OF DB PROCEDURES FOR SAFETY AND EASE OF USE
DELIMITER //

CREATE OR REPLACE PROCEDURE AddUser(
  EmailAddress VARCHAR(255),
	Password VARCHAR(255),
	Username VARCHAR(255),
	OUT UserId INT
) MODIFIES SQL DATA
BEGIN
	INSERT INTO User(EmailAddress, Password, Username)
	VALUES(EmailAddress, Password, Username);
	SELECT LAST_INSERT_ID() INTO UserId;
END;
//

CREATE OR REPLACE PROCEDURE AddAction(
  UserId INT,
  Player VARCHAR(255),
	InputTime DATETIME,
	GameTransaction VARCHAR(255),
	GameTransactionValue VARCHAR(255),
	GameId INT
) MODIFIES SQL DATA
BEGIN
	INSERT INTO Actions(UserId, Player, InputTime, GameTransaction, GameTransactionValue, GameId)
	VALUES(UserId, Player, InputTime, GameTransaction, GameTransactionValue, GameId);
END;
//

CREATE OR REPLACE PROCEDURE AddSession(
  UserId INT,
  OUT SessionId INT
  ) MODIFIES SQL DATA
BEGIN
	INSERT INTO GameSession(UserId)
	VALUES(UserId);
	SELECT LAST_INSERT_ID() INTO SessionId;
END;
//

CREATE OR REPLACE PROCEDURE AddSessionStart(
  SessionId INT,
	LoginTime DATETIME
	) MODIFIES SQL DATA
BEGIN
	INSERT INTO SessionStart(SessionId, LoginTime)
	VALUES(SessionId, LoginTime);
END;
//

CREATE OR REPLACE PROCEDURE AddSessionEnd(
  SessionId INT,
	LogoutTime DATETIME
	) MODIFIES SQL DATA
BEGIN
	INSERT INTO SessionEnd(SessionId, LogoutTime)
	VALUES(SessionId, LogoutTime);
END;
//

CREATE OR REPLACE PROCEDURE AddScore(
  GameId INT,
	Score FLOAT
	) MODIFIES SQL DATA
BEGIN
	INSERT INTO Score(GameId, Score)
	VALUES(GameId, Score);
END;
//

CREATE OR REPLACE PROCEDURE GetUser(
  UserId VARCHAR(255)
) READS SQL DATA
BEGIN
  SELECT
    u.Username,
    GROUP_CONCAT(g.ImageId SEPARATOR ',') AS Images
  FROM User u LEFT JOIN Game g ON u.UserId = g.PlayerOne OR u.UserId = g.PlayerTwo
  WHERE
    u.UserId = UserId
  GROUP BY u.UserId;
END;
//

CREATE OR REPLACE PROCEDURE GetUserScore(
	UserId INT
) READS SQL DATA
BEGIN
	SELECT SUM(s.Score) as Total, u.UserName as User
	FROM User u LEFT JOIN Game g ON (g.PlayerOne = u.UserId OR g.PlayerTwo = u.UserId)
							LEFT JOIN Score s ON s.GameId = g.GameId JOIN (
		SELECT a.GameId
		FROM Actions a
		WHERE a.GameTransactionValue = 'regular' OR a.GameTransactionValue = 'accept'
	) tmp ON s.GameId = tmp.GameId
	WHERE u.UserId = UserId
	GROUP BY u.UserId
	ORDER BY Total DESC
	LIMIT 10;
END;
//

CREATE OR REPLACE PROCEDURE GetScore(
) READS SQL DATA
BEGIN
	SELECT SUM(s.Score) as Total, u.UserName as User
	FROM User u LEFT JOIN Game g ON (g.PlayerOne = u.UserId OR g.PlayerTwo = u.UserId)
							LEFT JOIN Score s ON s.GameId = g.GameId JOIN (
		SELECT a.GameId
		FROM Actions a
		WHERE a.GameTransactionValue = 'regular' OR a.GameTransactionValue = 'accept'
	) tmp ON s.GameId = tmp.GameId
	GROUP BY u.UserId
	ORDER BY Total DESC
  LIMIT 10;
END;
//

CREATE OR REPLACE PROCEDURE GetPassword(
  EmailAddress VARCHAR(255)
) READS SQL DATA
BEGIN
  SELECT
    u.Password
  FROM User u
  WHERE
    u.EmailAddress = EmailAddress;
END;
//

CREATE OR REPLACE PROCEDURE AddImage(
  Image VARCHAR(255),
  Path VARCHAR(255),
  Level INT,
  ClassLabel VARCHAR(255),
  OUT ImageId INT
) MODIFIES SQL DATA
BEGIN
  INSERT INTO Image(Image, Path, Level, ClassLabel)
	VALUES(Image, Path, Level, ClassLabel);
	SELECT LAST_INSERT_ID() INTO ImageId;
END;
//

CREATE OR REPLACE PROCEDURE GetImage(
  ImageId VARCHAR(255)
) READS SQL DATA
BEGIN
  SELECT i.Image, i.Path
  FROM Image i
  WHERE i.ImageId = ImageId;
END;
//

CREATE OR REPLACE PROCEDURE GetAllImages(
	Level INT
) READS SQL DATA
BEGIN
	SELECT i.ImageId
	FROM Image i LEFT JOIN (
		SELECT g.ImageId as ImageId, count(g.GameId) as Count
		FROM Game g INNER JOIN (
			SELECT a.GameId
			FROM Actions a
			WHERE a.GameTransaction = 'endOfGame' AND ( a.GameTransactionValue = 'accept' OR a.GameTransactionValue = 'regular')
		) a ON a.GameId = g.GameId
		GROUP BY g.ImageId
	) g ON g.ImageId = i.ImageId
	WHERE (g.Count < 6 OR g.Count IS NULL) AND i.Level = Level;
END;
//

CREATE OR REPLACE PROCEDURE AddSegment(
  Image VARCHAR(255),
  Segment VARCHAR(255),
  OUT SegmentId INT
) MODIFIES SQL DATA
BEGIN
  INSERT INTO Segment(Image, Segment, ImageId)
	VALUES(Image, Segment, 1);
	SELECT LAST_INSERT_ID() INTO SegmentId;
END;
//

CREATE OR REPLACE PROCEDURE AddGame(
  PlayerOne INT,
	PlayerTwo INT,
	PlayerOneRole VARCHAR(255),
	PlayerTwoRole VARCHAR(255),
	ImageId INT,
	OUT GameId INT
) MODIFIES SQL DATA
BEGIN
	INSERT INTO Game(PlayerOne, PlayerTwo, PlayerOneRole, PlayerTwoRole, ImageId)
	VALUES(PlayerOne, PlayerTwo, PlayerOneRole, PlayerTwoRole,ImageId);
	SELECT LAST_INSERT_ID() INTO GameId;
END;
//

CREATE OR REPLACE PROCEDURE GetValidatedUser(
  EmailAddress VARCHAR(255),
	Password VARCHAR(255)
) READS SQL DATA
BEGIN
	SELECT
	  u.UserId,
	  u.EmailAddress
	FROM User u
	WHERE
		u.EmailAddress = EmailAddress
		AND u.Password = Password;
END;