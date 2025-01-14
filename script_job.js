import { baseURL } from './config.js';

document.addEventListener("DOMContentLoaded", async () => {
    const jobTitle = document.getElementById("job-title");
    const jobZone = document.getElementById("job-zone");
    const jobDescription = document.getElementById("job-description");
    const jobStatus = document.getElementById("job-status");
    const jobImage = document.getElementById("job-image");
    const statusSelect = document.getElementById("status");
    const additionalInfo = document.getElementById('additional-info');
    const repairReason = document.getElementById("repair-reason");

    // ฟังก์ชันปรับขนาดอัตโนมัติ
    repairReason.addEventListener("input", function () {
        this.style.height = "auto"; // รีเซ็ตความสูงก่อน
        this.style.height = this.scrollHeight + "px"; // ปรับขนาดตามเนื้อหา
    });
    // ดึง job_id จาก URL
    const urlParams = new URLSearchParams(window.location.search);
    const jobID = urlParams.get("job_id");

    if (!jobID) {
        // หากไม่มี user_id แสดงข้อความเตือนและบล็อคการใช้งาน
        document.getElementById('lockScreen').style.display = 'flex';  // แสดงล็อคหน้าจอ
        document.body.style.pointerEvents = 'none';
        return;
    }
    try {
        // เรียก API เพื่อเช็คสถานะ
        const response = await fetch(`${baseURL}/repairs/${jobID}`, {headers: {'Content-Type': 'application/json',"ngrok-skip-browser-warning": "69420"}});
        const resdata = await response.json()
        const repairStatus = resdata['repair']['status']
        console.log(repairStatus)
        
        if (!response.ok) {
            document.getElementById('lockScreen').style.display = 'flex';
            document.body.style.pointerEvents = 'none';
            document.querySelector('.message h2').textContent = 'ไม่สามารถโหลดข้อมูลได้';
        }

        if (repairStatus === 'รอช่างประเมิน' || repairStatus === 'รอผจกอนุมัติ' ||repairStatus === 'ซ่อมเสร็จ' ){

            document.getElementById('lockScreen').style.display = 'flex';
            document.body.style.pointerEvents = 'none';
            document.querySelector('.message h2').textContent = `ไม่สามารถแก้ไขได้เพราะ ${repairStatus}`;

        }


    } catch (error) {
        document.getElementById('lockScreen').style.display = 'flex';
        document.body.style.pointerEvents = 'none';
        document.querySelector('.message h2').textContent = 'ไม่สามารถโหลดข้อมูลได้';
    }  
    // ตรวจสอบการเปลี่ยนสถานะ
    statusSelect.addEventListener('change', () => {
        console.log(statusSelect.value)
        if (statusSelect.value === 'ซ่อมเสร็จ') {
            additionalInfo.style.display = 'block'; // แสดงฟอร์มเพิ่มเติม
        } else {
            additionalInfo.style.display = 'none'; // ซ่อนฟอร์มเพิ่มเติม
        }
    });
    // เพิ่ม event listener ให้ฟอร์ม
    document.getElementById('confirm-button').addEventListener('click', function (e) {
        e.preventDefault();
    
        const statusSelect = document.getElementById('status');
        const selectedStatus = statusSelect.value;
        const reason = document.getElementById('repair-reason').value;
        const imageFile = document.getElementById('repair-image').files[0];
    
        // วัตถุ data ที่จะส่งไปยังเซิร์ฟเวอร์
        const data = {
            status: selectedStatus,
        };
    
        // หากมีรูปภาพ ให้แปลงเป็น Base64 ก่อน
        if (imageFile) {
            const reader = new FileReader();
            
            reader.onload = function (event) {
                const base64Image = event.target.result; // ผลลัพธ์ของการแปลงเป็น Base64
                data.repair_succ_image = base64Image; // เพิ่ม base64 รูปภาพใน data
    
                // ตรวจสอบสถานะและเพิ่มข้อมูลใน data
                if (selectedStatus === 'กำลังทำ') {
                    data.mechanic_start_date_time = getFormattedDateTime() // เพิ่มเวลาปัจจุบัน
                } else if (selectedStatus === 'ซ่อมเสร็จ') {
                    if (!reason || !base64Image) {
                        alert('กรุณากรอกสาเหตุการซ่อมและอัปโหลดรูปภาพ');
                        return;
                    }
                    data.mechanic_succ_date_time = getFormattedDateTime() // เพิ่มเวลาปัจจุบัน
                    data.cause_of_repair = reason; // เพิ่มสาเหตุการซ่อม
                }
    
                // ส่งข้อมูลไปยังเซิร์ฟเวอร์
                console.log('ข้อมูลที่จะส่ง:', data);
    
                // เรียกใช้ฟังก์ชันบันทึกข้อมูล
                savedata(data);
            };
    
            // อ่านไฟล์รูปภาพเป็น Base64
            reader.readAsDataURL(imageFile);
        } else {
            // หากไม่มีรูปภาพ ให้ดำเนินการตามปกติ
            if (selectedStatus === 'กำลังทำ') {
                data.mechanic_start_date_time = getFormattedDateTime()
            } else if (selectedStatus === 'ซ่อมเสร็จ') {
                if (!reason) {
                    alert('กรุณากรอกสาเหตุการซ่อม');
                    return;
                }
                data.mechanic_succ_date_time = getFormattedDateTime()
                data.cause_of_repair = reason;
            }
    
            // ส่งข้อมูลไปยังเซิร์ฟเวอร์
            console.log('ข้อมูลที่จะส่ง:', data);
    
            // เรียกใช้ฟังก์ชันบันทึกข้อมูล
            savedata(data);
        }
    });

    // ฟังก์ชันดึงข้อมูลรายละเอียดงาน
    async function fetchJobDetails() {
        try {
            const response = await fetch(`${baseURL}/repairs/${jobID}`, {headers: {'Content-Type': 'application/json',"ngrok-skip-browser-warning": "69420"}}); // เรียก API
            if (!response.ok) throw new Error("Failed to fetch job details");


            const responseData = await response.json();
            const job = responseData['repair']
            jobTitle.textContent = `รายละเอียดงาน #${responseData.gen_id}`;
            jobDescription.textContent = job.details;
            jobZone.textContent = job.zone;
            jobStatus.textContent = job.status;

            // แสดงรูปภาพงาน
            jobImage.innerHTML = job['image']
                ? `<img src="${job['image']}" alt="Job Image">`
                : "<p>ไม่มีรูปภาพ</p>";

            // ตั้งค่าสถานะใน dropdown ให้ตรงกับสถานะปัจจุบัน
            statusSelect.value = job.status;
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการโหลดข้อมูลงาน");
            console.error(error);
        }
    }

    // ฟังก์ชันอัปเดตสถานะงาน
    // Function to update job status
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
            
            // หลังจากเรียก API ตัวแรกสำเร็จ ให้เรียก API ตัวที่สอง
            if (data.status === 'ซ่อมเสร็จ') {
                callSecondAPI(); // เรียกฟังก์ชันเพื่อทำการส่งคำขอ API ตัวที่สอง
                google_sheet_api();
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }

    // ฟังก์ชันที่เรียก API ตัวที่สองหลังจากสถานะ "ซ่อมเสร็จ"
    function callSecondAPI() {
        fetch(`${baseURL}/line/repair/succ`, {
            method: "POST", // หรือ PUT ขึ้นอยู่กับที่ API ที่สองต้องการ
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify({
                // ข้อมูลที่ต้องการส่งไปยัง API ตัวที่สอง
                job_id: jobID,
            })
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`API 2 failed with status: ${response.status}`);
            }
            return response.json();
        })
        .then((responseData) => {
            console.log("Second API Success:", responseData);
        })
        .catch((error) => {
            console.error("Second API Error:", error);
        });
    }

    function google_sheet_api() {
        console.log("Calling google_sheet_api...");
    
        fetch(`${baseURL}/googlesheet`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "69420"
            },
            body: JSON.stringify({
                job_id: jobID,
            })
        })
        .then((response) => {
            console.log("Google sheet API response status:", response.status); // ตรวจสอบสถานะ
            if (!response.ok) {
                throw new Error(`API 3 failed with status: ${response.status}`);
            }
            return response.json();
        })
        .then((responseData) => {
            console.log("Third API Success:", responseData);
        })
        .catch((error) => {
            console.error("Third API Error:", error);
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

    // เรียกใช้งานฟังก์ชันดึงข้อมูล
    fetchJobDetails();


});
