# README #

## Quick summary
The server code live in the server directory.

The web app code lives in the web directory.

### How do I get set up? ###


#### Web Client
* Dependencies
    * NPM  - [Install Node](https://nodejs.org/en/download/)
    * Bower  - `npm install -g bower`


To run the web project locally

*  change to web directory `> cd web `

* Install dependencies
<pre>
> npm install
> bower install
</pre>

* create proxy.js (file should be ignored)
<pre>
var url = '[enter localhost server url]';
exports.url = url;
</pre>

* run app locally
<pre>
> npm start
</pre>


#### Server

* To install cloud storage client library

`pip install GoogleAppEngineCloudStorageClient -t lib`

* How to run tests

    * Python Tests
    
        Make sure webtest is installed, if not, run

        <pre> sudo easy_install WebTest </pre>

        If using mac, run test from the project root as 

        <pre> python tests/runner.py /usr/local/google_appengine </pre>
        

### How to deploy
@TODO (Tola)

### Contribution guidelines ###

* Writing tests
    * Testing Web Client
        * @TODO (Tola)
    * Testing Server
        * Refer to [Appengine Doc](https://cloud.google.com/appengine/docs/standard/python/tools/localunittesting) 
* Code review
* Other guidelines
   * Javascript [style guide](https://github.com/airbnb/javascript)
   * Python [style guide](https://google.github.io/styleguide/pyguide.html)


