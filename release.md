
```
$ npm set init.author.name "Masatomi KINO"
$ npm set init.author.email "masatomix@example.com"
$ npm set init.author.url "http://qiita.com/masatomix"

$ npm login
```



package.json のバージョンが0.1.0をリリースする手順

```
$ git checkout 0.1.0   <- これでpackage.jsonが0.1.0が落ちてくる想定
$ npm publish ./
```

参考

- [初めてのnpm パッケージ公開](https://qiita.com/TsutomuNakamura/items/f943e0490d509f128ae2)
- [package.json のチルダ(~) とキャレット(^)](https://qiita.com/sotarok/items/4ebd4cfedab186355867)
- [npmでpackageのバージョンを調べる](https://blog.katsubemakito.net/nodejs/npm_info_version)

