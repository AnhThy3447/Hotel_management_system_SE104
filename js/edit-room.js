* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    background-color: #FAF8F3;
    color: #3E2723;
}

.container {
    display: flex;
    height: 100vh;
}

/* Main */
.main-content {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
}

/* Breadcrumb */
.breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 24px;
    font-size: 14px;
}

.breadcrumb a {
    color: #8D6E63;
    text-decoration: none;
}

.breadcrumb a:hover {
    color: #6D4C41;
}

.breadcrumb .separator {
    color: #BCAAA4;
}

.breadcrumb span:last-child {
    color: #6D4C41;
}

/* Header */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
}

.page-header h2 {
    font-size: 32px;
    font-weight: 500;
    color: #5D4037;
}

/* Delete button */
.btn-delete {
    padding: 12px 24px;
    background-color: #D32F2F;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}

.btn-delete:hover {
    background-color: #B71C1C;
}

/* Form */
.room-form {
    max-width: 900px;
}

.form-section {
    background: white;
    border: 1px solid #D7CCC8;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
}

.form-section h3 {
    font-size: 20px;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #EFEBE9;
}

/* Grid */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group label {
    font-size: 14px;
    margin-bottom: 8px;
}

.required {
    color: #D32F2F;
}

.form-group input,
.form-group select {
    padding: 12px 16px;
    border: 1px solid #D7CCC8;
    border-radius: 8px;
    font-size: 16px;
}

.form-group input:focus,
.form-group select:focus {
    border-color: #8D6E63;
    outline: none;
}

/* Actions */
.form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
    margin-top: 32px;
}

.btn-cancel,
.btn-submit {
    padding: 14px 32px;
    border-radius: 8px;
    font-size: 16px;
    cursor: pointer;
}

.btn-cancel {
    background: white;
    border: 1px solid #D7CCC8;
    color: #8D6E63;
}

.btn-submit {
    background: #8D6E63;
    color: white;
    border: none;
}

/* Responsive */
@media (max-width: 768px) {
    .main-content {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column-reverse;
    }

    .btn-cancel,
    .btn-submit {
        width: 100%;
    }
}
