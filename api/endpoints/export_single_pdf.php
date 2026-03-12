<?php
header("Access-Control-Allow-Origin: *");

require_once '../vendor/autoload.php';
include_once '../config/Database.php';

use Dompdf\Dompdf;
use Dompdf\Options;

$log_id = isset($_GET['log_id']) ? $_GET['log_id'] : die("log_id required");
$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die("user_id required");

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Database connection failed.");
}

$query = "SELECT ol.*, u.username FROM ojt_logs ol JOIN users u ON ol.user_id = u.id WHERE ol.id = ? AND ol.user_id = ?";
$stmt = $db->prepare($query);
$stmt->execute([$log_id, $user_id]);
$log = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$log) {
    die("Log not found.");
}

$photo_stmt = $db->prepare("SELECT photo_url FROM log_photos WHERE log_id = ? ORDER BY created_at ASC");
$photo_stmt->execute([$log_id]);
$photos = $photo_stmt->fetchAll(PDO::FETCH_ASSOC);

$day_num = $log['day_number'] ? (int)$log['day_number'] : 1;
$week_num = $log['week_number'] ? (int)$log['week_number'] : ceil($day_num / 5);

$suffixes = array(1 => 'ST', 2 => 'ND', 3 => 'RD');
$suffix = isset($suffixes[$week_num]) ? $suffixes[$week_num] : 'TH';
$week_label = $week_num . '<sup>' . $suffix . '</sup>';

$date_obj = DateTime::createFromFormat('Y-m-d', $log['log_date']);
$formatted_date = $date_obj ? $date_obj->format('F j, Y') : $log['log_date'];

$desc = nl2br(htmlspecialchars(html_entity_decode($log['task_desc'])));

$photo_html = '';
if (!empty($photos)) {
    $encoded = [];
    foreach ($photos as $photo) {
        $filepath = __DIR__ . '/../' . $photo['photo_url'];
        if (!file_exists($filepath)) {
            continue;
        }

        $mimeType = mime_content_type($filepath);
        if (strpos((string)$mimeType, 'image/') !== 0) {
            continue;
        }

        $imgData = base64_encode(file_get_contents($filepath));
        $encoded[] = 'data:' . $mimeType . ';base64,' . $imgData;
    }

    if (!empty($encoded)) {
        $cols = 2;
        $photo_html .= '<div style="margin-top: 20px; page-break-inside: avoid;">';
        $photo_html .= '<table width="100%" cellspacing="8" cellpadding="0" style="border-collapse: separate; border-spacing: 8px;">';
        $photo_html .= '<tr>';
        $count = 0;

        foreach ($encoded as $src) {
            if ($count > 0 && $count % $cols === 0) {
                $photo_html .= '</tr><tr>';
            }

            $photo_html .= '<td style="text-align: center; vertical-align: top; padding: 0;">';
            $photo_html .= '<div style="width: 2.5in; height: 3in; margin: 0 auto; border: 1px solid #ccc; overflow: hidden;">';
            $photo_html .= '<img src="' . $src . '" style="width: 2.5in; height: 3in; object-fit: cover; display: block;" />';
            $photo_html .= '</div>';
            $photo_html .= '</td>';
            $count++;
        }

        $remainder = $count % $cols;
        if ($remainder !== 0) {
            for ($i = $remainder; $i < $cols; $i++) {
                $photo_html .= '<td></td>';
            }
        }

        $photo_html .= '</tr></table>';
        $photo_html .= '</div>';
    }
}

$html = '<html>
<head>
    <style>
        @page { margin: 60px 70px; }
        body {
            font-family: "Times New Roman", Times, serif;
            font-size: 12pt;
            color: #000;
            line-height: 1.6;
        }
        .title {
            font-weight: bold;
            font-size: 13pt;
            margin-bottom: 14px;
        }
        .week {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 10px;
        }
        .day-date {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 14px;
        }
        .description {
            text-align: justify;
            font-size: 12pt;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="title">DAILY ACCOMPLISHMENT REPORT</div>
    <div class="week">' . $week_label . ' WEEK</div>
    <div class="day-date">Day ' . $day_num . ' &ndash; ' . $formatted_date . '</div>
    <div class="description">' . $desc . '</div>
    ' . $photo_html . '
</body>
</html>';

$options = new Options();
$options->set('isHtml5ParserEnabled', true);
$options->set('isRemoteEnabled', true);
$options->set('defaultFont', 'Times New Roman');

$dompdf = new Dompdf($options);
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$filename = 'Day_' . $day_num . '_' . $log['log_date'] . '.pdf';
$dompdf->stream($filename, array("Attachment" => true));
?>
