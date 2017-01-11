// hello-package/api/helloworld.js
var helloworld = module.exports;
function hello(req,res,next) {
    console.log(res);
    res.send('Hello world!');
}
 helloworld.routes = [
    { path: '/hello', httpMethod: 'GET', middleware: hello }
]