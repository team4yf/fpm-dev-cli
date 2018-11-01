#!/usr/bin/env node
'use strict';
const path = require('path');
const fs = require('fs');
const program = require('commander');
const version = require('./package.json').version;
const download = require('download-git-repo');

const dir = process.cwd();
const local = __dirname;
const TEMPLATE_DIR = path.join(local, 'template', 'fpm-cms-ng1');

const NG1_GIT_REP = 'team4yf/fpm-cms-ng1-starter';

program.version(version);

const deletedir = (dir) => {
    if(!fs.existsSync(dir)) {
        return
    }
    let files = []
    files = fs.readdirSync(dir)
    files.forEach((file, index) => {
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
    let readable, writable, curPath, destPath
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


const rename = (plugin) => {
    fs.rename('fpm-plugin-dev-template-master', 'fpm-plugin-' + (plugin || 'noname'), (err) => {
        if(err) console.log(err)
    })
}

program.command('update')
    .description('update the fpm plugin template project')
    .action(function(){
        if(fs.existsSync(TEMPLATE_DIR)){
            // remove
            console.info('Remove The Older Template Project.')
            deletedir(TEMPLATE_DIR)
        }
        console.info('Download The Lasted Template Project.')
        download(NG1_GIT_REP, TEMPLATE_DIR, function(err){
            if(err){
                console.error(err);
                return;
            }
            console.info('Download Ok');
        })
    })

const init = (cmsProjectName) => {
    const pluginPkgPath = path.join(dir, cmsProjectName, 'package.json')
    const pkginfo = require(pluginPkgPath)
    pkginfo.name = cmsProjectName
    pkginfo.description = `A Plugin Named [${ cmsProjectName }] For YF-FPM-SERVER~`

    fs.writeFile(pluginPkgPath, JSON.stringify(pkginfo, null, 2), function(err){
        if(err){
            console.error(err);
            return;
        }
        console.info('Init Ok , Enjoy It');
    })
}

program.command('ng1')
    .description('Init the fpm cms project')
    .action(function(options) {
        const cmsName = options
        const cmsProjectName = 'fpm-cms-' + cmsName
        const cmsProjectPath = path.join(dir, cmsProjectName)
        if(fs.existsSync(TEMPLATE_DIR)){
            // copy from disk
            copydir(TEMPLATE_DIR, cmsProjectPath);
            init(cmsProjectName, cmsProjectPath)
            return;
        }
        console.info('Download The Lasted Template Project.')
        download(NG1_GIT_REP, TEMPLATE_DIR, function(err){
            if(err){
                console.error(err);
                return;
            }
            copydir(TEMPLATE_DIR, cmsProjectPath);
            init(cmsProjectName, cmsProjectPath)
        })
    });


program.parse(process.argv);
