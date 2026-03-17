<?php

$superAdminEmails = explode(',', (string) env('SUPER_ADMIN_EMAILS', ''));

return [
    'super_admin_emails' => array_values(array_filter(array_map(
        static fn (string $email): string => strtolower(trim($email)),
        $superAdminEmails,
    ))),
];
