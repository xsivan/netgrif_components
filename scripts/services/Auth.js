/**
 * Created by Milan on 31.1.2017.
 */
define(['angular','angularRoute','../modules/Main'],function (angular) {
    angular.module('ngMain').factory('$auth',function ($http, $location, $rootScope ,$log) {
        var auth = {
            authenticated: false,

            loginPath: "/login",
            userPath: "user",
            logoutPath: "/logout",
            appPath: "/",
            path: $location.path(),

            authenticate: function (credentials, callback) {
                $log.debug(credentials);
                var headers = credentials && credentials.username ? {
                    'Authorization' : "Basic " + btoa(credentials.username + ":" + credentials.password)
                } : {};

                $log.debug(headers);
                $http.get(auth.userPath,{
                    headers: headers
                }).then(function (response) {
                    $log.debug(response);
                    auth.authenticated = !!response.name;
                    callback && callback(auth.authenticated);
                    $location.path(auth.path == auth.loginPath ? auth.appPath : auth.path);

                },function (response) {
                    $log.debug(response);
                    auth.authenticated = false;
                    callback && callback(false);
                });
            },
            logout: function () {
                $location.path(auth.loginPath);
                auth.authenticated = false;

                $http.post(auth.logoutPath,{}).then(function () {
                    $log.debug("Logout successful");
                }, function () {
                    $log.debug("Logout failed");
                });
            },
            init: function () {
                this.authenticate({},function (isLogedIn) {
                    if(isLogedIn) $location.path(auth.path);
                });

                $rootScope.$on('$locationChangeStart',function () {
                    if($location.path != auth.loginPath){
                        auth.path = $location.path();
                        if(!auth.authenticated) $location.path(auth.loginPath);
                    }
                });
            }
        };
        return auth;
    });
});