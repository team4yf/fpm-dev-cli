#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const program = require('commander');
const debug = require('debug')('fpm-cms-dev-cli')
const VERSION = require('./package.json').version;
const download = require('download-git-repo');

const dir = process.cwd();
const local = __dirname;

const TEMPLATE_DIR = {
  'ng1': path.join(local, 'template', 'fpm-cms-ng1')
}

const GIT_REP = {
  'ng1': 'team4yf/fpm-cms-ng1-starter',
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
  pkginfo.description = `A Project Named [${ projName }] For YF-FPM-SERVER~`

  fs.writeFile(projPkgPath, JSON.stringify(pkginfo, null, 2), function(err){
    if(err){
      console.error(err);
      return;
    }
    console.info('Init Ok , Enjoy It');
  })
}


program.version(VERSION)

let template = 'ng1';
program.option('-t, --template <template>', 'use a template to create project, default ng1')
// template = program.template;
// debug('Args %s',  template)

program.command('update')
  .description('update the fpm cms template project')
  .action(() =>{
    debug('Run update command: %O, %O', template, TEMPLATE_DIR[template])
    if(fs.existsSync(TEMPLATE_DIR[template])){
      // remove
      console.info('Remove The Older Template Project.')
      deletedir(TEMPLATE_DIR[template])
    }
    console.info('Download The Lasted Template Project.')
    download(GIT_REP[template], TEMPLATE_DIR[template], (err) => {
      if(err){
        console.error(err);
        return;
      }
      console.info('Download Ok');
    })
  })

program.command('create')
  .description('create the fpm cms template project')
  .action(() =>{
    const cmsName = options
    const cmsProjectName = 'fpm-cms-' + cmsName
    const cmsProjectPath = path.join(dir, cmsProjectName)
    if(fs.existsSync(TEMPLATE_DIR[template])){
      // copy from disk
      copydir(TEMPLATE_DIR[template], cmsProjectPath);
      init(cmsProjectName)
      return;
    }
    console.info('Download The Lasted Template Project.')
    download(GIT_REP[template], TEMPLATE_DIR[template], (err) => {
      if(err){
        console.error(err);
        return;
      }
      copydir(TEMPLATE_DIR[template], cmsProjectPath);
      init(cmsProjectName)
    })
  })



  .parse(process.argv);
