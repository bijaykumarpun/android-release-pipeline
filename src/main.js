
const core = require('@actions/core');
const github = require('@actions/github');

try{
const name = core.getInput('who-to-greet');
console.log(`Hello ${name}`);

const time = (new Date()).toTimeString();
core.setOutput("time",time);
} catch (error){
core.setFailed(error.message);
}