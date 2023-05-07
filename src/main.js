import * as publisherApi from '@googleapis/androidpublisher';
import { androidpublisher } from '@googleapis/androidpublisher';
import { promises as fs, createReadStream } from 'fs';
import { version } from 'os';

const core = require('@actions/core');
const androidPublisher = publisherApi.androidpublisher('v3');

try {

    //Base setup
    const serviceAccountJson = core.getInput('serviceAccountJson');
    const packageName = core.getInput('packageName');
    const releaseFileDir = core.getInput('releaseFileDir');
    const releaseTrack = core.getInput('releaseTrack');
    const mappingFileDir = core.getInput('mappingFileDir');

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

    switch (releaseTrack) {
        case ReleaseTrack.INTERNAL_SHARING:
            uploadToInternalSharing(auth, packageName, releaseFileDir);

        case ReleaseTrack.PRODUCTION:
            uploadToProduction(auth, packageName, releaseFileDir, mappingFileDir);

    }



} catch (error) {
    core.setFailed(error.message);
}

function uploadToInternalSharing(auth, packageName, releaseFileDir) {
    const uploadResult = androidPublisher.internalappsharingartifacts.uploadapk(
        {
            auth: auth,
            packageName: packageName,
            media: {
                mimeType: 'application/vnd.android.package-archive',
                body: createReadStream(releaseFileDir)
            }
        }
    );
    const downloadUrl = uploadResult.data.downloadUrl;
    // if(uploadResult.data.download)
    console.log("DATA:\nUpload to internal shring\nURL: $downloadUrl");
}

function uploadToProduction(auth, packageName, track, releaseName, releaseFileDir, mappingFileDir) {
    const versionCode = null;


    //Create an Edit
    const editResult = androidpublisher.edits.insert({
        auth: auth,
        packageName: packageName
    });

    //Upload release files
    if (releaseFileDir.endsWith('.apk')) {
        const res = androidPublisher.edits.apks.upload({
            auth: auth,
            packageName: packageName,
            editId: editResult.id,
            media: {
                mimeType: 'application/vnd.android.package-archive',
                body: fs.createReadStream(releaseFileDir)
            }
        });
        versionCode = res.data.versionCode;

    } else if (releaseFileDir.endsWith('.aab')) {
        const res = androidpublisher.edits.bundles.upload({
            auth: auth,
            packageName: packageName,
            editId: editResult.id,
            media: {
                mimeType: 'application/octed-stream',
                body: fs.createReadStream(releaseFileDir)

            }
        });
        versionCode = res.data.versionCode;

    } else Error('invalid release file');

    //upload mapping file
    androidpublisher.edits.deobfuscationfiles.upload({
        auth: auth,
        packageName: packageName,
        editId: editResult.id,
        versionCode: versionCode,
        deobfuscationFileType: 'proguard',
        media: {
            mimeType: 'application/octed-sctream',
            body: fs.createReadStream(mappingFileDir)
        }
    });

    //add releases to track
    if (versionCode != null) {

        androidpublisher.edits.tracks.update(
            {
                auth: auth,
                editId: editResult.id,
                packageName: packageName,
                track: track,
                releases: [
                    {
                        name: releaseName,
                        userFraction: 1,
                        status: 'completed',
                        inAppUpdatePriority: 5,
                        releaseNotes: [{
                            language: 'en-US',
                            text: 'This is a test release note'
                        }],
                        versionCode: ["1.2.0"]
                    }
                ]
            }
        )
    } else throw Error('version code is null');

    //finally commit
    const commitResult = androidPublisher.edits.commit({
        auth: auth,
        editId: editResult.id,
        packageName: packageName,
        changesNotSentForReview: true
    })

}








