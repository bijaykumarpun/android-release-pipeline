import * as publisherApi from '@googleapis/androidpublisher';

const core = require('@actions/core');
const fs = require('fs').promises;
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

    const serviceAccountFile = "serviceAccountJson.json";
    await fs.writeFile(serviceAccountFile, serviceAccountJson, function (err) {
        if (err) {
            console.log('Error');
        } else {
            console.log('Successfully written');
        }
    });

    core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountFile);
    const auth = new publisherApi.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    androidPublisher.internalappsharingartifacts.uploadapk(
        {
            auth: auth,
            packageName: packageName,
            media: {
                mimeType: 'application/vnd.android.package-archive',
                body: fs.createReadStream(releaseFileDir)
            }
        }
    );



} catch (error){
core.setFailed(error.message);
}