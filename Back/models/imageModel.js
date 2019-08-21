const pool = require('../connection/connection');
const fs = require('fs');
const authModel = require('./authenticationModel');

const PATH = (process.env.NODE_ENV === 'krul')? '/media/datenhalde/re2one/segments': './segments';

exports.getSegmentMap = async (imageId) => {
    let segmentMap = new Array();
    let connection;
    let image;
    try {
        console.log('(image model): creating new Game');
        connection = await pool.getConnection();
        console.log('(image model): retrieving image path from db');
        image = await connection.query('CALL GetImage(?);', [imageId]);
    }
    catch (error) {
        throw error;
    }
    finally {
        if (connection) {
            connection.end();
        }
    }
    fs.readFileSync(`${PATH}/${image[0][0].Path}/${image[0][0].Path}.txt`)
        .toString('utf-8')
        .split(/\n+/)
        .forEach(l => {
                segmentMap.push(l.split(' '));
            }
        );
    return segmentMap;
};

exports.getImageSegment = async (request, imageId) => {
    let connection;
    let segment;
    try {
        connection = await pool.getConnection();
        console.log('(image model): retrieving image path from db');
        const image = await connection.query('CALL GetImage(?);', [imageId]);
        console.log(`(image model): reading image from file - ./segments/${image[0][0].Path}/${image[0][0].Path}_segment_${request.params.segmentId}.png`);
        let state = await authModel.getState(request.headers.authorization);
        if(parseInt(request.params.segmentId, 10) === -1){
            segment = fs.readFileSync(`${PATH}/${image[0][0].Path}/${image[0][0].Path}_segment_boundaries.png`);
        } else if(parseInt(request.params.segmentId, 10) === -2 && state === 'finalRound') {
            segment = fs.readFileSync(`${PATH}/${image[0][0].Path}/${image[0][0].Path}.JPEG`);
        } else {
            segment = fs.readFileSync(`${PATH}/${image[0][0].Path}/${image[0][0].Path}_segment_${request.params.segmentId}.png`);
        }
        console.log('(image model): sending response');
    }
    catch (error) {
        throw error;
    } finally {
        if (connection) {
            connection.end();
        }
    }
    return segment;
};

exports.getImageDimension = async (imageId) => {
    let connection;
    let dimension;
    let image;
    console.log("================= image id ===================");
    console.log(imageId);
    try {
        connection = await pool.getConnection();
        console.log('(image model): retrieving image path from db');
        image = await connection.query('CALL GetImage(?);', [imageId]);
        console.log(image);
        dimension = JSON.parse(fs.readFileSync(`${PATH}/${image[0][0].Path}/${image[0][0].Path}.json`).toString('utf-8'));
    }
    catch (error) {
        throw error;
    } finally {
        if (connection) {
            connection.end();
        }
    }
    return dimension;
};

