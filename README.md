# communitiles

A Game with the Purpose of Understanding Differences between Human and Machine Image Recognition.

This game is a variation of Luis von-Ahn's [Peekaboom][boom] Game. But instead of collecting bounding boxes for object location within Images, we aim to extract the object features that are the most important for humans to understand the displayed object.

Therefore, we divide the images into patches and try to infer a sequence of ranks of said patches by proceeding similar to von-Ahns game:
One player, the recommender, starts by seeing all patches as well as the associated labels. He then pitches a segment he deems the most discriminative of the labels to the second player, the guesser.
The second player starts without any information and with a hidden image. After receiving the first uncovered segment, he has multiple tries to guess the correct label.
The players proceed alternating until the correct label has been guessed or the time ran out.

For a more detailed description, please refer to the in-game documentation.
Please notice that the issues and todos as well as the setup with docker containers and a more detailed blog post will be added soon.

## Setup

U are advised to take the following steps after downloading the git to setup the applications (Frontend, Backend, Database).

### Without [Docker][docker]

#### Prerequisites:

* An installation of [nodejs][nodejs]. The LTS version is sufficient.
* An installation of [MariaDB][mariadb].
* A Set of images to be used within the Games. We went with a subset of the [ILSVRC2012][images] validation set.
* For a production deployment of the Backend you would need a process manager like PM2
* For a production deployment of the Frontend you would need a webserver like Apache or Nginx

#### Preparing the Images
To prepare the images for usage within the application, we need to apply the steps. All is done by **/Image_Segmentation/segmentation.py**. Please note that its coded very narrow to our specific needs and may be revised to match yours.  
Also make sure you have installed the necessary python modules.

##### Segmentation
We applied k-means clustering in form of scikit-learns **skimage.segmentation.slic()** to the images.
We used n_segments=50, compactness=30, sigma=3 as parameters. The **/Image_Segmentation/segmentation.py** script exports the following things each contained in a folder per image:
* The whole Image.
* An image per patch, with everythings except the patches alpha channel set to zero.
* An image containing a grid to seperate the patches visually.
* A .txt file containing a mapping of each pixel to its respectve patch.
* A .json file containing the images annotation (in our setup, information from the image sets ground trouth as well as manual annotations).

##### Image Annotation
Please note, that in this specific case we used the annotations.csv, meta.mat and the ILSVRC2012s ground truth. You might need to fit the script to match your image and annotation sources.

_IMPORTANT_

The contents of the resulting directory, **"/Image_Segmentation/segmentation/"**, will be needed completely within the application. Therefore, the whole directory needs to be copied into the Back/ directory.  
Further, the script outputs the file **init_content.sql**. This file needs to be moved to the **/DB/scripts/** directory to be executed later.  
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

#### Writing the necessary Config Files

##### Database Configuration Within The Backend
1) You will need to place a file with the following content within the **/Back/config/** directory:
```javascript=
let config = {
    host: '<your-database-hosts-ip>',
    user: 'root',
    password: '<your-database-root-password>',
    port: 3306, // the standard express.js port, you might want to use another one
    database: 'AuthenticationDB'
};

module.exports = config;
```
2) You need to add these config to the Database connection file **/Back/connection/connection.js**. Add the following to the head of the file:
```javascript=
if (process.env.NODE_ENV === '<your-environment-variables-value') {
    config = require('../config/<your-config-filename-without-.js-extension>');
}
```

3) You need to specify the mentioned environment variable and eventually a different port in the **/Back/package.json** in the **scripts** object:
```javascript=
"scripts": {
    "start": "node ./bin/www",
    "my-startscript": "NODE_ENV=MY_ENVIRONMENT node ./bin/www", // like this
    "example-startscript": "NODE_ENV=EXAMPLE PORT=12345 node ./bin/www" // or like this
  }
```

##### Websocket configuration within the Backend
You need to configure the Ports the websockets use within the files **/Back/controller/online.js** (line 22) and **/Back/controller/timersocket.js** (line 19). You can use the currently configured ports for local testing, but might need to change them to match your available ports on your production system.

##### Local Proxy Configuration for the Frontend
1) You need to add a .json file containing the following to the Frontend directory **/Front/<your-config-name>.conf.json**
```json=
{
  "/api": {
    "target": "http://<your-backends-ip>:<your-backends-port>/", // Port = 300 if you're using express default port
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {"^/api" : ""}
  }
}

```
    
_IMPORTANT_
    
Within an productive environment, you might not need this config as your webservers configuration will perform this task.
    
2) You need to specify this proxy config within the startup script in the **/Front/package.json** script object as follows:
```json=
"scripts": {
    "ng": "ng",
    "<your-script>": "ng serve --proxy-config <your-config>.conf.json --host 0.0.0.0 --configuration=<your-config>",
    "build": "ng build",
    "PRODUCTION_BUILD": "ng build --output-path=./dist/out --configuration krul --base-href=/<the-servers-public-directory>",
    "test": "ng test",
    "lint": "ng lint",
    "e2e": "ng e2e"
}

```
_IMPORTANT_
    
For a production build, you need to copy the contents of /FRONT/dist/out to your webservers public directory. PLEASE NOTE THAT YOU NEED TO SPECIFY THIS DIRECTORY WITHIN THE PRODUCTION_BUILD COMMAND!
    
##### Websocket configuration within the Frontend

You need to refer to the websocket ports you assigned in the backend.
Therefore you need to assign the respective variables within an environment file contained in **/Front/src/environments/environment.<your-environment-name>.ts** like this:
```typescript=
export const environment = {
  production: false,
  envName: '<your-environment-name>',
  gamesocket: 'http://<your-backends-ip>:<the-gamesocket-port>/', // the port assigned in timersocket.js
  onlinesocket: 'http://<your-backends-ip>:<the-onlinesocket-port>/'
};
```
    
_IMPORTANT_

Please ensure to refer to this environment in your **/Front/package.json** within your startscript. 
Therefore please add the **--configuration <your-environment-name>** option to the script. Afterwards, you need to edit your **/Front/angular.json** as follows:
1) To the **projects.Front.architect.build.configurations** please add:
```json=
"<your-environment-name>": {
    "fileReplacements": [
        {
            "replace": "src/environments/environment.ts",
            "with": "src/environments/environment.<your-environment-name>.ts"
        }
    ]
}
```
2) To the To the **projects.Front.architect.serve.configurations** please add
```json=
"<your-environment-name>": {
    "browserTarget": "Front:build:<your-environment-name>"
}
```
    
#### Starting the Application
    
##### Backend
To start the application, please make sure the Database is running on your Backends host system.
You then start the backend with:
```shell=
$npm run <your-startscript>
```
In production, you would use a processmanager like PM2 to handle you application like:
```shell=
$NODE_NEV=<your-environment-variable> PORT=<your-open-port> pm2 start npm -- run <your-startscript>
```
Please make sure to have the processmanager installed first.
    
##### Frontend
You can start the Frontend via:
```shell=
$npm run <your-startscript>
```
Please note, that this way the application starts under localhost:4200.
In production, you would first build the application like this:
    
```shell=
$npm run <your-buildscript>
```
After that, you would copy the contents of **/Front/dist/out/** to your webservers public directory.
    
#### Additional info
In **/Back/models/userModel.js** line 12/13, there is a Database procedure call with and without argument. This was added to be able to limit a session to a subset of the available images (start with a certain 100 ones and proceed to another 50 ones afterwards e.g.).
The third argument of **AddImage()** within **/DB/scripts/init_content.sql** refers to this number.
To remove this, you would need to modify **GetAllImages()** within **/DB/scripts/init.sql**.

### With [Docker][Docker]
The Setup using Docker and Docker Compose will be added at a future date.

[docker]: https://docker.com
[blog]: https://google.de
[mariadb]: https://mariadb.org 
[nodejs]: https://nodejs.org/en
[images]: http://image-net.org/challenges/LSVRC/2012/index
[boom]: https://www.cs.cmu.edu/~biglou/Peekaboom.pdf
    
    