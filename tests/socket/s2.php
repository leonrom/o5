<html>
<head>
    <base href="http://javascript.ru"> <!-- для корректного поедания картинок -->
</head>
<body>
<h1>ответ будет здесь</h1>
<?PHP
// $ch = curl_init('http://php.su');
$ch = curl_init('https://qna.habr.com/q/332535');
curl_exec($ch); // выполняем запрос curl - обращаемся к сервера php.su
curl_close($ch);
?>
</body>
</html>
