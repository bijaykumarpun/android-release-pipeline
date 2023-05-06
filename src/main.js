import * as publisherApi from '@googleapis/androidpublisher';

const core = require('@actions/core');
const fs = require('fs');
const androidPublisher = publisherApi.androidpublisher('v3');

try {

const serviceAccountJson = core.getInput('serviceAccountJson');
const packageName = core.getInput('packageName');
const releaseFileDir = core.getInput('releaseFileDir');
//const track = core.getInput('track');
//const mappingFileDir = core.getInput('mappingFileDir');
    // console.log("Log test"+ serviceAccountJson);
    // console.log("Log test" + packageName);
    // console.log("Log test" + releaseFileDir);

    const serviceAccountFile = "./serviceAccountJson.json";
    fs.writeFile(serviceAccountFile, serviceAccountJson, function (err) {
        if (err) {
            console.log('Error');
        } else {
            console.log('Successfully written');
        }
    });

    // fs.open(serviceAccountFile, "w", function (err, fd) {
    //     if (err) {
    //         console.log("Can't open file");
    //     } else {
    //         console.log("Writing to file");
    //         fs.writeFile(fd, serviceAccountFile, 0, serviceAccountJson.length, null, function (err, writtenBytes) {
    //             if (err) {
    //                 console.log("Can't write to file");
    //             } else {
    //                 console.log("${writtenBytes} added")
    //             }
    //         })
    //     }
    // });

    core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountFile);
const auth = new publisherApi.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });
 androidPublisher.internalappsharingartifacts.uploadapk(
{
        auth: auth,
        packageName:packageName,
        media: {
            mimeType: 'application/octet-stream',
            body: fs.createReadStream(releaseFileDir)
        }
    }
);



} catch (error){
core.setFailed(error.message);
}