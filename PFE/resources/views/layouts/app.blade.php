<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'EduManager')</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            background: #f4f7fb;
            color: #172033;
        }

        .blade-shell {
            min-height: 100vh;
            padding: 40px 20px;
        }

        .blade-card {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e4ebf5;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
        }

        .blade-header {
            padding: 28px 32px;
            background: linear-gradient(135deg, #274b82, #3565a8);
            color: #ffffff;
        }

        .blade-header h1 {
            margin: 0;
            font-size: 30px;
        }

        .blade-header p {
            margin: 10px 0 0;
            opacity: 0.92;
        }

        .blade-content {
            padding: 32px;
        }

        .blade-meta {
            display: inline-block;
            padding: 8px 14px;
            border-radius: 999px;
            background: #eef4ff;
            color: #31588f;
            font-size: 14px;
            font-weight: 700;
        }

        .blade-section {
            margin-top: 22px;
            padding: 20px;
            border: 1px solid #e6edf7;
            border-radius: 18px;
            background: #fbfdff;
        }

        .blade-section h2 {
            margin: 0 0 12px;
            font-size: 20px;
        }

        .blade-section p {
            margin: 0;
            line-height: 1.7;
            color: #51607a;
        }
    </style>
</head>
<body>
    <div class="blade-shell">
        <div class="blade-card">
            <div class="blade-header">
                <h1>@yield('page_title', 'EduManager')</h1>
                <p>@yield('page_subtitle', 'Mise en page Blade avec @section et @yield')</p>
            </div>

            <div class="blade-content">
                @yield('content')
            </div>
        </div>
    </div>
</body>
</html>
