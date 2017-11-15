module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                // 定义一个用于插入合并输出文件之间的字符
                separator: ';'
            },
            dist: {
                // 将要被合并的文件
                src: ['src/domjs.js', 'src/util.js', 'src/module/funcs.js',
                    'src/module/http.js', 'src/module/jsonp.js', 'src/module/ajax.js', 'src/module/validate.js', 'src/module/form.js',
                    'src/template/template.js', 'src/template/util.js', 'src/template/funcs.js', 'src/template/syntax.js', 'src/template/render.js'
                ],
                // 合并后的JS文件的存放位置
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            options: {
                //大括号包裹
                curly: true,
                //对于简单类型，使用===和!==，而不是==和!=
                eqeqeq: true,
                //对于首字母大写的函数（声明的类），强制使用new
                newcap: true,
                //禁用arguments.caller和arguments.callee
                noarg: true,
                //对于属性使用aaa.bbb而不是aaa['bbb']
                sub: false,
                //查找所有未定义变量
                undef: true,
                //查找类似与if(a = 0)这样的代码
                boss: true,
                //指定运行环境为node.js
                node: true,
                "globals": {
                    "jQuery": false,
                    "window": false,
                    "document": false
                }
            },
            //具体任务配置
            files: {
                src: ['Gruntfile.js', 'src/module/*.js', 'src/template/*.js']
            }
        },
        watch: {
            start: {
                files: ['src/**/*.js']
            }
        }
    });

    // 加载包含 "uglify" 任务的插件。
    grunt.loadNpmTasks('grunt-contrib-uglify');
    //合并文件
    grunt.loadNpmTasks('grunt-contrib-concat');
    // 加载指定插件任务
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //文件变化监视
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 默认被执行的任务列表。
    grunt.registerTask('default', ['jshint', 'concat', 'uglify', 'watch']);

};
