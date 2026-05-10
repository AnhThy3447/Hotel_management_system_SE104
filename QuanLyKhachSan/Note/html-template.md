# Quy chuẩn cấu trúc trang HTML

Mỗi trang phải follow đúng template sau:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <!-- Meta -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Tiêu đề -->
    <title>[Tên trang] - Khách sạn Paradise</title>

    <!-- CSS chung -->
    <link rel="stylesheet" href="css/common.css">

    <!-- CSS riêng của trang -->
    <link rel="stylesheet" href="css/[page-name].css">
</head>

<body data-page="[page-name]">
    <div class="container">

        <!-- Sidebar -->
        <div id="sidebar-container"></div>

        <!-- Nội dung chính -->
        <main class="main-content">

            <!-- Header trang -->
            <header class="page-header">
                <h1>[Tên chức năng]</h1>
            </header>

            <!-- Nội dung -->
            <section class="content-section">
                
            </section>

        </main>
    </div>

    <!-- JS chung -->
    <script src="js/common.js"></script>

    <!-- JS riêng -->
    <script src="js/[page-name].js"></script>
</body>
</html>
```
