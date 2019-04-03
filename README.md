## fpm-dev-cli
用于创建fpm模板项目的脚手架

### Install
```bash
npm i -g fpm-dev-cli
```

### Templates

- fpm-cms-ng1-starter

  A web cms system. [See detail](https://github.com/team4yf/fpm-cms-ng1-starter)

### Useage
```bash
# fpm-cms update <template>
fpm-dev update cms-ng1
```

it will update the lasted template project from github

```bash
# fpm-cms create <proj> -t <template> -P
fpm-dev create admin -t cms-ng1 -P
```

it will create a project named `admin`

then you can dev the project