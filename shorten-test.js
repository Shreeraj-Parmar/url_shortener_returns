import http from "k6/http";

export const options = {
    vus: 10000,
    duration: "30s",
    summaryTrendStats: [
        "avg",
        "min",
        "med",
        "max",
        "p(90)",
        "p(95)",
        "p(99)"
    ]
};

export default function () {
    const payload = JSON.stringify({
        url: "https://bhasaijfdsojasdfj.com/sdfsdfsdfsdf/sdfsdfsdf"
    });

    const params = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    http.post(
        "http://localhost:8080/shorten",
        payload,
        params
    );
}