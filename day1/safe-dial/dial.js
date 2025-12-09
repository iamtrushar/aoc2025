const canvas = document.getElementById("dial");
const ctx = canvas.getContext("2d");
const center = { x: canvas.width / 2, y: canvas.height / 2 };
const radius = 120;


function drawDial(value) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // outer circle
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.lineWidth = 6;
    ctx.stroke();

    // ticks
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < 100; i += 10) {
        const a = (i / 100) * Math.PI * 2 - Math.PI / 2;
        const x = center.x + Math.cos(a) * (radius - 25);
        const y = center.y + Math.sin(a) * (radius - 25);
        ctx.fillText(i.toString(), x, y);
    }

    // needle
    const angle = (value / 100) * Math.PI * 2 - Math.PI / 2;
    const nx = center.x + Math.cos(angle) * (radius - 10);
    const ny = center.y + Math.sin(angle) * (radius - 10);

    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(nx, ny);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.stroke();

    document.getElementById("value").innerText = "Value: " + value;
}

function applyDialCommand(cmd) {
    const direction = cmd[0].toUpperCase();
    const amount = parseInt(cmd.slice(1), 10);

    if (isNaN(amount)) {
        console.error("Invalid dial command:", cmd);
        return;
    }

    if (direction === "L") {
        currentValue = (currentValue - amount + 100) % 100;
    } else if (direction === "R") {
        currentValue = (currentValue + amount) % 100;
    }

    drawDial(currentValue);

    // Notify ESRI if connected
    if (window.onDialChange) {
        window.onDialChange(currentValue);
    }
}

async function runDialSequence(commands) {
    let zeroCount = 0;

    for (const cmd of commands) {
        applyDialCommand(cmd);

        if (currentValue === 0) {
            zeroCount++;
        }

        await new Promise(res => setTimeout(res, 10));
    }

    console.log("Zero count:", zeroCount);

    return zeroCount;
}

async function loadCommandsFromFile() {
    const response = await fetch("input.txt");
    const text = await response.text();

    const commands = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

    return commands;
}

let currentValue = 50;
drawDial(currentValue);

window.addEventListener("DOMContentLoaded", async () => {
    const commands = await loadCommandsFromFile();
    console.log("Commands loaded:", commands);

    const zeroCount = await runDialSequence(commands);
    document.getElementById("zeroCounter").innerText = "Zero Count: " + zeroCount;
});
