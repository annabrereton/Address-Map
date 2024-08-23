<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Tree;

class HomeController
{
    public function home()
    {
        $addresses = Address::all();
        $trees = Tree::all();
//dd($trees);
        return view('welcome', compact('addresses', 'trees'));
    }
}
