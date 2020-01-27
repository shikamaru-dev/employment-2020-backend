# 当番アプリ管理ツール - nuxt

> 当番アプリのデータ管理ツール

## Build Setup

/backend/nuxt
``` bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## デプロイ関連

Firebase初期設定(Fuctions,Storage,Hosting,Firestore)   
https://firebase.google.com/docs/cli?hl=ja  

Firebaseプロジェクト  
https://console.firebase.google.com/project/employment-2020/overview  

FirebaseHosting URL  
https://employment-2020.firebaseapp.com  


```
# /backend/nuxt

# /backend/publicに静的ファイルを生成
$ yarn generate

$ cd ../

# /backend
# Hostingにデプロイ
$ firebase deploy --only hosting
```

Firebase Authenticationによるユーザー管理  
管理画面のログインでも使用
