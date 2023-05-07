import * as publisherApi from '@googleapis/androidpublisher';
import { promises as fs, createReadStream } from 'fs';


const core = require('@actions/core');
const androidPublisher = publisherApi.androidpublisher('v3');
// const ReleaseTrack = require("./release_tracks");

async function init() {


try {

    //Base setup
    const serviceAccountJson = core.getInput('serviceAccountJson');
    const packageName = core.getInput('packageName');
    const releaseFileDir = core.getInput('releaseFileDir');
    const releaseTrack = core.getInput('track');
    const mappingFileDir = core.getInput('mappingFileDir');


    const serviceAccountFile = "serviceAccountJson.json";
    await fs.writeFile(serviceAccountFile, serviceAccountJson, function (err) {
        if (err) {
            core.setOutput('Error writing service account credential');
            console.log('Error');
        } else {
            core.setOutput('Successfully written service account credential');
            console.log('Successfully written');
        }
    });

    core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountFile);
    const auth = new publisherApi.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/androidpublisher']
    });

    switch (releaseTrack) {
        // case ReleaseTrack.INTERNAL_SHARING:
        case 'internalShring':
            uploadToInternalSharing(auth, packageName, releaseFileDir);

        // case ReleaseTrack.PRODUCTION:
        case 'production':
            uploadToProduction(auth, packageName, '', releaseFileDir, mappingFileDir);

    }



} catch (error) {
    core.setFailed(error.message);
}
}

async function uploadToInternalSharing(auth, packageName, releaseFileDir) {
    const uploadResult = await androidPublisher.internalappsharingartifacts.uploadapk(
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
    console.log(`DATA:\nUpload to internal shring\nURL: ${downloadUrl}`);
    core.setOutput(`DATA:\nUpload to internal shring\nURL: ${downloadUrl}`);
}

async function uploadToProduction(auth, packageName, releaseName, releaseFileDir, mappingFileDir) {
    var versionCode = null;


    //Create an Edit
    const editResult = await androidPublisher.edits.insert({
        auth: auth,
        packageName: packageName
    });
    core.setOutput(`Edit Id ${editResult.data.id}`);
    console.log(`Edit Id ${editResult.data.id}`);

    //Upload release files
    if (releaseFileDir.endsWith('.apk')) {
        const res = await androidPublisher.edits.apks.upload({
            auth: auth,
            packageName: packageName,
            editId: editResult.data.id,
            media: {
                mimeType: 'application/vnd.android.package-archive',
                body: createReadStream(releaseFileDir)
            }
        });
        versionCode = res.data.versionCode;
        console.log(`Version Code ${versionCode}`);
        core.setOutput(`Version Code ${versionCode}`)

    } else if (releaseFileDir.endsWith('.aab')) {
        const res = await androidPublisher.edits.bundles.upload({
            auth: auth,
            packageName: packageName,
            editId: editResult.data.id,
            media: {
                mimeType: 'application/octet-stream',
                body: createReadStream(releaseFileDir)

            }
        });
        versionCode = res.data.versionCode;
        console.log(`Version Code ${versionCode}`);
        core.setOutput(`Version Code ${versionCode}`)

    } else Error('invalid release file');

    //upload mapping file
    const fileUploadResult = await androidPublisher.edits.deobfuscationfiles.upload({
        auth: auth,
        packageName: packageName,
        editId: editResult.data.id,
        apkVersionCode: versionCode,
        deobfuscationFileType: 'proguard',
        media: {
            mimeType: 'application/octet-stream',
            body: createReadStream(mappingFileDir)
        }
    });


    //add releases to track
    if (versionCode != null) {

        await androidPublisher.edits.tracks.update(
            {
                auth: auth,
                editId: editResult.data.id,
                packageName: packageName,
                track: 'production',

                requestBody: {
                    track: 'production',
                    releases:

                    {
                        name: releaseName,
                        // userFraction: status == 'completed' ? undefined : userFraction,
                        status: 'completed',
                        inAppUpdatePriority: 5,
                        releaseNotes: [{
                            language: 'en-US',
                            text: 'This is a test release note'
                        }],
                        versionCodes: [versionCode.toString()]
                    }
                }

            }
        )
    } else throw Error('version code is null');

    //finally commit
    const commitResult = await androidPublisher.edits.commit({
        auth: auth,
        editId: editResult.data.id,
        packageName: packageName,
        // changesNotSentForReview: true
    })

}




init();





