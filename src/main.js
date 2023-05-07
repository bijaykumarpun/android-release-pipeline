import * as publisherApi from '@googleapis/androidpublisher';
import { promises as fs, createReadStream } from 'fs';

const core = require('@actions/core');
const androidPublisher = publisherApi.androidpublisher('v3');

try {

    const serviceAccountJson = core.getInput('serviceAccountJson');
    const packageName = core.getInput('packageName');
    const releaseFileDir = core.getInput('releaseFileDir');

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
                body: createReadStream(releaseFileDir)
            }
        }
    );

} catch (error){
    core.setFailed(error.message);
}