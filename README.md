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
To prepare the images for usage within the application, we need to apply the steps. All is done by segmentation.py within the Image_Segmentation directory. Please note that its coded very narrow to our specific needs and may be revised to match yours.

##### Segmentation
We applied k-means clustering in form of sklearn-image.slic() to the images.
We used n_segments=50, compactness=30, sigma=3 as parameters. The segmentation.py script exports the following things each contained in a folder per image:
* The whole Image.
* An image per patch, with everythings except the patches alpha channel set to zero.
* An image containing a grid to seperate the patches visually.
* A .txt file containing a mapping of each pixel to its respectve patch.
* A .json file containing the images annotation.

##### Image Annotation
Please note, that in this specific case we used the annotations.csv, meta.mat and the ILSVRC2012s ground truth. You might need to fit the script to match your image and annotation sources.

##### IMPORTANT

The contents of the resulting directory, "segmentation", will be needed completely within the application. Therefore, the whole directory needs to be copied into the Back/ directory.  
Further, the script outputs the file init_content.sql. This file needs to be moved to the DB/scripts/ directoryto be executed later.  
Also, the segmentation of the images might need some time, depending on your systems capabilities.


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
The Setup using Docker and Docker Compose will be added at a future date.

[docker]: https://docker.com
[blog]: https://google.de
[mariadb]: https://mariadb.org 
[nodejs]: https://nodejs.org/en
[images]: http://image-net.org/challenges/LSVRC/2012/index