 function updatePrice() {
            const roomType = document.getElementById('roomType').value;
            const priceInput = document.getElementById('price');
            
            const prices = {
                'Phòng tiêu chuẩn': 150000,
                'Phòng cao cấp': 170000,
                'Phòng hạng sang': 200000
            };
            
            if (prices[roomType]) {
                priceInput.value = prices[roomType];
            }
        }

        function handleSubmit(event) {
            event.preventDefault();
            alert('Cập nhật phòng thành công!');
            window.location.href = 'rooms.html';
        }

        function deleteRoom() {
            if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
                alert('Đã xóa phòng thành công!');
                window.location.href = 'rooms.html';
            }
        }