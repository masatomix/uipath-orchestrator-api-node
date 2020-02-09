
```
$ npm set init.author.name "Masatomi KINO"
$ npm set init.author.email "masatomix@example.com"
$ npm set init.author.url "http://qiita.com/masatomix"

$ npm login
```

tag 0.1.0 をリリースする。(すでにタグは存在するとして。)

```
$ git checkout 0.1.0 
$ npm publish ./
```

多分これでタグ指定でリリースできると思われる、、、。