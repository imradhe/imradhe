<?php

/**
 * GraphenePHP Router
 *
 * This file contains the Routing System for the GraphenePHP framework.
 *
 * Routes live in routes.json and are matched top to bottom; the first match wins.
 * A route such as "blog/{slug}" exposes the captured value as $_REQUEST['slug'].
 *
 * @package GraphenePHP
 * @version 2.0.1
 */

class Router
{
    public $request;
    public $queries;
    public $routes = [];
    public $slug;

    public function __construct(array $request)
    {
        $this->request = $request['REQUEST_URI'];
        // Appending "?" keeps this safe for URLs that have no query string
        $this->queries = explode("&", explode("?", $this->request . "?")[1]);
        $this->routes = json_decode(file_get_contents('routes.json'), true);
    }

    public function run()
    {
        require('config.php');
        $uri = explode("?", $this->request)[0];
        $query = (string) ($_SERVER['QUERY_STRING'] ?? '');
        $this->request = (string) ((empty($config['APP_SLUG'])) ? substr($uri, 1) : substr($uri, strlen($config['APP_SLUG']) + 2));

        if (substr($this->request, -1) === "/") {
            // /blog/ -> /blog (the query string is kept)
            return header("Location:" . home() . rtrim($this->request, "/") . ($query === '' ? '' : '?' . $query));
        } else {
            if (empty(trim($this->request))) {
                return include('views/index.php');
            } else {
                $routes = $this->routes;
                $routeFound = false;
                foreach ($routes as $route => $data) {

                    if (preg_match($this->getPattern($route), $this->request, $matches)) {
                        if (!is_file($data['path'])) {
                            // The route is declared but its view is missing: 404 instead of a blank page
                            break;
                        }
                        $this->setRouteVariables($data, $matches);
                        include($data['path']);
                        $routeFound = true;
                        break;
                    }
                }
                if (!$routeFound) {
                    return pageNotFound();
                }
            }
        }
    }

    private function getPattern($route)
    {
        // Quote the literal parts of the route (so "." and friends are not regex
        // wildcards), then turn each {name} placeholder into a named capture group.
        $parts = preg_split('/{(\w+)}/', $route, -1, PREG_SPLIT_DELIM_CAPTURE);
        $pattern = '';
        foreach ($parts as $i => $part) {
            $pattern .= ($i % 2 === 0) ? preg_quote($part, '#') : '(?P<' . $part . '>[\w@.-]+)';
        }
        return '#^' . $pattern . '$#';
    }


    private function setRouteVariables(&$data, $matches)
    {
        foreach ($matches as $key => $value) {
            if (is_string($key) && !empty($value)) {
                $_REQUEST[$key] = $value;
            }
        }
    }


}
