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
                console.log(job)


                // แสดงเฉพาะงานที่สถานะไม่ใช่ "ซ่อมเสร็จ"
                if (job.status !== "ซ่อมเสร็จ") {
                    const jobCard = document.createElement("div");
                    jobCard.classList.add("job-card");
                    
                    const urlObj = new URL(window.location.href);
                    const imageURL = `${job.image}`
                    // เพิ่มข้อมูลการ์ด
                    jobCard.innerHTML = `
                        <img src="${imageURL}" alt="Job Image">
                        <div class="job-info">
                            <h3>${job.zone}</h3>
                            <p><strong>รายละเอียด:</strong> ${job.details}</p>
                            <p class="status">${job.status}</p>
                            <button onclick="location.href='${urlObj.protocol}/website/job.html?job_id=${jobId}'">
                                แก้ไขสถานะงาน
                            </button>
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
});
