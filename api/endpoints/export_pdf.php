<?php
header("Access-Control-Allow-Origin: *");

require_once '../vendor/autoload.php';
include_once '../config/Database.php';

use Dompdf\Dompdf;
use Dompdf\Options;

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : die("User ID required");

$database = new Database();
$db = $database->getConnection();

$query = "SELECT task_desc, hours, log_date FROM ojt_logs WHERE user_id = ? ORDER BY log_date ASC";
$stmt = $db->prepare($query);
$stmt->bindParam(1, $user_id);
$stmt->execute();

$html = "
<html>
<head>
    <style>
        body { font-family: sans-serif; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .total { font-weight: bold; }
    </style>
</head>
<body>
    <h2 class='text-center'>Weekly Accomplishment Report</h2>
    <p>OJT Trainee ID: " . htmlspecialchars($user_id) . "</p>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Task Description</th>
                <th>Hours</th>
            </tr>
        </thead>
        <tbody>
";

$total_hours = 0;
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $html .= "<tr>";
    $html .= "<td>" . htmlspecialchars($row['log_date']) . "</td>";
    $html .= "<td>" . htmlspecialchars($row['task_desc']) . "</td>";
    $html .= "<td>" . htmlspecialchars($row['hours']) . "</td>";
    $html .= "</tr>";
    $total_hours += $row['hours'];
}

$html .= "
        </tbody>
        <tfoot>
            <tr>
                <td colspan='2' class='text-right total'>Total Hours:</td>
                <td class='total'>" . $total_hours . "</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
";

$options = new Options();
$options->set('isHtml5ParserEnabled', true);
$options->set('isRemoteEnabled', true);

$dompdf = new Dompdf($options);
$dompdf->loadHtml($html);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$dompdf->stream("weekly_accomplishment_report.pdf", array("Attachment" => true));
?>
