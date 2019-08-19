# communitiles

A Game with the Purpose of Understanding Differences between Human and Machine Image Recognition.
To learn about the game mechanics, please head over to my [blog][blog].

## Setup

U are advised to take the following steps after downloading the git to setup the applications (Frontend, Backend, Database).

### Without [Docker][docker]

#### Prerequisites:

* An installation of [nodejs][nodejs]. The LTS version is sufficient.
* An installation of [MariaDB][mariadb].
* A Set of images to be used within the Games. We went with a subset of the [ILSVRC2012][images] validation set.

#### Preparing the Images

##### Segmentation



#### Installing the necessary Libraries

##### Frontend & Backend
By executing npm install within the Front/ and Back/ directories, the necessary node packages (contained in the package.json files) will be installed.
```console 
$cd <<path-to-project>>/communitiles/Front/ && npm install
$cd ../Back/ && npm install
```

##### Database
Connect to your local Database and execute both of the init scripts found in the communitiles/DB/scripts/ directory. A new Database with the name AuthenticationDB will be created and the necessary tables will be added.
```console 
$mysql -u root -p < <<path-to-project>>/communitiles/DB/Scripts/init.sql
$mysql -u root -p < <<path-to-project>>/communitiles/DB/Scripts/init_content.sql
```

#### Config Files
let config = {
    host: 'localhost',
    user: 'root',
    password: '1337',
    port: 3306,
    database: 'AuthenticationDB'
};

module.exports = config;


#### Preparing the Images




### With [Docker][Docker]

[docker]: https://docker.com
[blog]: https://google.de
[mariadb]: https://mariadb.org 
[nodejs]: https://nodejs.org/en
[images]: http://image-net.org/challenges/LSVRC/2012/index
