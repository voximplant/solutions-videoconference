To set the app  
copy Env.example.js to Env.js

and set
``` credentials: {
            userName: 'your VoxImlant username',
            appName: 'your application name first_part',
            accountName: 'secondpart till .voximplant.com',
            password: 'you_password',
          },
```
for example for: 
videoconf.videoconf-dev.n4.voximplant.com

_your application name first_part = videoconf_
_secondpart till .voximplant.com = videoconf-dev.n4_


also you need change CONNECTION_STRING in WSService.js
```` 
 const CONNECTION_STRING = 'ws://localhost:9012';
```
