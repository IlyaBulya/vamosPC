<?php

namespace App\Services\Compatibility;

enum Severity: string
{
    case Error = 'error';
    case Warning = 'warning';
}
