## Run Locally

`yarn`

`cd client && yarn`

`cd ../ && yarn dev`

Frontend: `http://localhost:3000/`
Backend: `http://localhost:5000/api/hello`

## Run https locally

Make sure there are certs created and stored in the `certs` folder

Change the `oauth-vendor.html` to `localhost:3000/at?` from `/at?`

Run `yarn dev-https`

Frontend: `yarn dev-https:app`
Backend: `yarn dev-https:server`


## Deploy to Heroku

### First time

`git init`

`hcreate` - Creates a new Heroku app based on directory name

Add Buildpacks
`heroku buildpacks:set heroku/nodejs`


Or individually:
`heroku config:set GIT_SSH_HOST="gitlab.com"`
`heroku config:set GIT_SSH_KEY=$(cat /Users/jmac/.ssh/id_rsa | base64)`
`heroku config:set SSH_HOSTS="ssh://git@gitlab.com"`
`heroku config:set SSH_KEY=$(cat /Users/jmac/.ssh/id_rsa | base64)`

And the Vendor Client ID and Secret:
`heroku config:set VENDOR_CLIENT_ID="SOMEKINDOFID" VENDOR_CLIENT_SECRET="SOMEKINDOFID"`

`hpush`

## Material UI

Icons - https://material.io/tools/icons/?style=baseline

## Source Github

https://github.com/esausilva/react-production-deployment/tree/master/heroku

## Source Medium Blog Post

https://blog.bitsrc.io/react-production-deployment-part-3-heroku-316319744885
