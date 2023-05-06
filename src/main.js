import * as publisherApi from '@googleapis/androidpublisher';

const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const androidPublisher = publisherApi.androidpublisher('v3');


//try{
//const name = core.getInput('who-to-greet');
//console.log(`Hello ${name}`);
//
//const time = (new Date()).toTimeString();
//core.setOutput("time",time);
//} catch (error){
//core.setFailed(error.message);
//}

try {

const serviceAccountJson = core.getInput('serviceAccountJson');
const packageName = core.getInput('packageName');
const releaseFileDir = core.getInput('releaseFileDir');
//const track = core.getInput('track');
//const mappingFileDir = core.getInput('mappingFileDir');
console.log("Log test"+ serviceAccountJson);
console.log("Log test" + packageName);
console.log("Log test" + releaseFileDir);

core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS",serviceAccountJson);
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