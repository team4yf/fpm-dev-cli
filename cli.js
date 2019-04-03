#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const program = require('commander');
const debug = require('debug')('fpm-dev-cli')
const VERSION = require('./package.json').version;
const download = require('download-git-repo');

const dir = process.cwd();
const local = __dirname;

const getPath = template => {
  return {
    localDir: path.join(local, 'template', `fpm-${template}`),
    gitRep: `team4yf/fpm-${template}-starter`,
  }
}

const deletedir = (dir) => {
  if(!fs.existsSync(dir)) {
    return
  }
  let files = []
  files = fs.readdirSync(dir)
  files.forEach((file) => {
    let curPath = path.join(dir, file)
    if(fs.statSync(curPath).isDirectory()) { // recurse
      deletedir(curPath)
    } else { // delete file
      fs.unlinkSync(curPath)
    }
  })
  fs.rmdirSync(dir)
}

const copydir = (src, dest) => {
  fs.mkdirSync(dest)
  let files = fs.readdirSync(src)
  let curPath, destPath
  files.forEach(file => {
    curPath = path.join(src, file)
    destPath = path.join( dest, file)
    if(fs.statSync(curPath).isDirectory()) { // recurse
      copydir(curPath, destPath)
    } else {
      fs.copyFileSync(curPath, destPath)
    }
  })

}

const init = (projName) => {
  const projPkgPath = path.join(dir, projName, 'package.json')
  const pkginfo = require(projPkgPath)
  pkginfo.name = projName
  pkginfo.description = `A Project Named [${ projName }] Created by fpm-dev-cli`

  fs.writeFile(projPkgPath, JSON.stringify(pkginfo, null, 2), function(err){
    if(err){
      console.error(err);
      return;
    }
    console.info('Init Ok , Enjoy It');
  })
}


program.version(VERSION)

program.command('update [template]')
  .description('update the fpm template project')
  .option('-f, --force', 'force to download the lasted template proj')
  .action((template, options) =>{
    const { force = false } = options;
    const { gitRep, localDir } = getPath(template);
    debug('Run update command: %O, %O, Template Proj path: %s', template, force, localDir)
    if(fs.existsSync(localDir)){
      if(!force){
        // use the cached
        console.info('Use the cached project.')
        return;
      }
      // remove
      console.info('Remove The Older Template Project.')
      deletedir(localDir)
    }
    console.info('Download The Lasted Template Project.')
    download(gitRep, localDir, (err) => {
      if(err){
        console.error(err);
        return;
      }
      console.info('Download Ok');
    })
  })

program.command('create [name]')
  .description('create the fpm template project')
  .option('-t, --template <template>', 'use a template to create project, default cms-ng1')
  .option('-P, --no-prefix', 'without fpm- prefix')
  .action((name, options) =>{
    const { template = 'cms-ng1', prefix = true } = options;
    const { gitRep, localDir } = getPath(template);
    debug('Run create command: %s, %s', name, template)
    const projName = `${prefix?'fpm-':''}${name}`
    const cmsProjectPath = path.join(dir, projName)
    if(fs.existsSync(localDir)){
      // copy from disk
      copydir(localDir, cmsProjectPath);
      init(projName)
      return;
    }
    console.info('Download The Lasted Template Project.')
    download(gitRep, localDir, (err) => {
      if(err){
        console.error(err);
        return;
      }
      copydir(localDir, cmsProjectPath);
      init(projName)
    })
  })



program.parse(process.argv);
