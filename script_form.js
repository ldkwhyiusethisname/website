import { baseURL } from './config.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search); // ดึง URL query string
    const jobID = urlParams.get('job_id'); // ดึงค่า user_id
    console.log(jobID)


    // ตรวจสอบค่า user_id
    if (!jobID) {
        // หากไม่มี user_id แสดงข้อความเตือนและบล็อคการใช้งาน
        document.getElementById('lockScreen').style.display = 'flex';  // แสดงล็อคหน้าจอ
        document.body.style.pointerEvents = 'none';
        return;
    }
    try {
        // เรียก API เพื่อเช็คสถานะ
        const response = await fetch(`${baseURL}/repairs/${jobID}`, {headers: {'Content-Type': 'application/json',"ngrok-skip-browser-warning": "69420"}});
        
        if (!response.ok) {
            document.getElementById('lockScreen').style.display = 'flex';
            document.body.style.pointerEvents = 'none';
            document.querySelector('.message h2').textContent = 'ไม่สามารถโหลดข้อมูลได้';
        }

        const data = await response.json();
        const repairStatus = data.repair.status; // ดึงค่า repair_status จาก API

        // ตรวจสอบสถานะ repair_status
        if (repairStatus !== 'รอช่างประเมิน') {
            document.getElementById('lockScreen').style.display = 'flex';
            document.body.style.pointerEvents = 'none';
            document.querySelector('.message h2').textContent = 'งานนี้ถูกดำเนินการไปแล้ว';
            return
        }
    } catch (error) {
        document.getElementById('lockScreen').style.display = 'flex';
        document.body.style.pointerEvents = 'none';
        document.querySelector('.message h2').textContent = 'ไม่สามารถโหลดข้อมูลได้';
    }

    const canRepairRadio = document.getElementById('canRepair');
    const cannotRepairRadio = document.getElementById('cannotRepair');
    const repairDetails = document.getElementById('repairDetails');
    const noRepairDetails = document.getElementById('noRepairDetails');

    // ฟังก์ชันสำหรับแสดง/ซ่อนฟิลด์
    canRepairRadio.addEventListener('change', () => {
        if (canRepairRadio.checked) {
            repairDetails.classList.remove('d-none');
            noRepairDetails.classList.add('d-none');
        }
    });

    cannotRepairRadio.addEventListener('change', () => {
        if (cannotRepairRadio.checked) {
            noRepairDetails.classList.remove('d-none');
            repairDetails.classList.add('d-none');
        }
    });


    document.getElementById('repairForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const data = {
            status : 'รอผจกอนุมัติ',
            job_id: jobID,
            description: document.getElementById('description').value,
            materials: document.getElementById('materials').value,
            estimated_cost: document.getElementById('estimated_cost').value,

            budget_date_time: getFormattedDateTime()
        };
        send_line_boss(data);
        savedata(data);

    });
    // ฟังก์ชันสำหรับส่งข้อมูลไปยัง API แรก
    function savedata(data) {
        fetch(`${baseURL}/editrepairs/${jobID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((responseData) => {
            console.log("Success:", responseData);
            // alert("Request sent successfully!");

            // เมื่อการส่งข้อมูลสำเร็จ ให้เรียกฟังก์ชัน API อีกอันหนึ่ง
        })
        .catch((error) => {
            console.error("Error:", error);
            // alert("Failed to send request.");
        });
    }

    function send_line_boss(data) {
        console.log(data)
        fetch(`${baseURL}/line/boss`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify(data),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((secondResponseData) => {
            console.log("Second request success:", secondResponseData);
            // alert("Second request sent successfully!");
        })
        .catch((error) => {
            console.error("Error:", error);
            // alert("Failed to send second request.");
        });
    }

    function getFormattedDateTime() {
        const now = new Date(); // เวลาปัจจุบัน

        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0
        const year = String(now.getFullYear() + 543).slice(-2); // เอาเฉพาะสองหลักสุดท้าย

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        // จัดรูปแบบเป็น "dd/mm/yy - h:m"
        return `${day}/${month}/${year} - ${hours}:${minutes}`;
    }
})

