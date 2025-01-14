import { baseURL } from './config.js';

document.addEventListener("DOMContentLoaded", async () => {

    try {
        const response = await fetch(`${baseURL}/repairs/`, {headers: {'Content-Type': 'application/json',"ngrok-skip-browser-warning": "69420"}});
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); // ดึงข้อมูล JSON จาก API

        // ตรวจสอบว่า data.repairs มีค่าและเป็นอ็อบเจกต์
        if (data.repairs && typeof data.repairs === 'object') {
            const jobs = data.repairs; // เข้าถึงคีย์ `repairs`
            const jobContainer = document.getElementById("job-container");

            Object.keys(jobs).forEach(jobId => {
                
                const job = jobs[jobId];


                // แสดงเฉพาะงานที่สถานะไม่ใช่ "ซ่อมเสร็จ"
                if (job.status !== "ซ่อมเสร็จ") {
                    const jobCard = document.createElement("div");
                    jobCard.classList.add("job-card");
                    
                    const imageURL = `${job.image}`
                    // เพิ่มข้อมูลการ์ด
                    jobCard.innerHTML = `
                        <img src="${imageURL}" alt="Job Image">
                        <div class="job-info">
                            <h3>${job.zone}</h3>
                            <p><strong>รายละเอียด:</strong> ${job.details}</p>
                            <p class="status">${job.status}</p>
                            <button data-job-id="${jobId}">เปิดดูรายละเอียด</button>
                        </div>
                    `;
                    jobContainer.appendChild(jobCard);
                }
            });
        } else {
            throw new Error('Invalid data structure: repairs not found');
        }
    } catch (error) {
        console.error("Error fetching jobs:", error);
        const jobContainer = document.getElementById("job-container");
        jobContainer.innerHTML = `<p style="color: red;">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>`;
    }

        const jobContainer = document.getElementById("job-container");
    
        jobContainer.addEventListener("click", (event) => {
            if (event.target.tagName === "BUTTON") {
                const jobId = event.target.dataset.jobId;
                if (jobId) {
                    showDetails(jobId);
                }
            }
        });

    async function showDetails(jobId) {
    
        try {
            const response = await fetch(`${baseURL}/repairs/${jobId}`, {headers: {'Content-Type': 'application/json',"ngrok-skip-browser-warning": "69420"}});
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const data = await response.json();
            const job = data['repair']; // เข้าถึงคีย์ `repairs`
            console.log(job)
            const modalDetails = document.getElementById("modal-details");
            
            // เพิ่มข้อมูลรายละเอียดใน modal
            modalDetails.innerHTML = `
                <p><strong>ชื่อจริง-สกุล:</strong> ${job.full_name}</p>
                <p><strong>เบอร์โทร:</strong> ${job.phone_number}</p>
                <p><strong>โซน:</strong> ${job.zone}</p>
                <p><strong>ประเภทงานซ่อม:</strong> ${job.repair_type}</p>
                <p><strong>รายละเอียด:</strong> ${job.details}</p>
                <p><strong>ความสำคัญของงาน:</strong> ${job.urgency}</p>
                <p><strong>สถานะ:</strong> ${job.status}</p>
                <img src="${job.image}" alt="Job Image" style="width:100%;height:auto;">
            `;
            
            // แสดง modal
            const modal = document.getElementById("job-modal");
            modal.style.display = "block";
        } catch (error) {
            console.error("Error fetching job details:", error);
            alert("เกิดข้อผิดพลาดในการโหลดข้อมูลรายละเอียด");
        }
    }
    const closeButton = document.querySelector(".modal-footer");
    closeButton.addEventListener("click", closeModal);
    
    function closeModal() {
        const modal = document.getElementById("job-modal");
        modal.style.display = "none";
    }
});
