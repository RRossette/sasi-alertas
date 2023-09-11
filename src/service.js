const sendSasi = async (data_obj) => { //aqui tá funcionando
    if (Object.entries(data_obj.images).length === 0 || data_obj.images === null) {
        const response = await send_sasi_api();
        return response
    }

    let session = "";

    const resultResponse = Promise.allSettled(Object.entries(data_obj.images).map(getImagesBlob))
        .then(async (results) => {
            const dataAttachments = {};

            for (const result of results) {
                if (result.status === "rejected") {
                    continue;
                }

                const imageData = result.value;
                const key = imageData.key;

                for (const blob of imageData.blobs) {
                    const fd = new FormData();
                    fd.append("image", blob);

                    try {
                        const data = await send_image(fd, session);
                        if (!session) {
                            session = data.session;
                        }
                        dataAttachments[key] = [...(dataAttachments[key] || []), data.attachmentUuid];
                    } catch (err) {
                        console.error(err);
                    }
                }
            }

            return dataAttachments;
        })
        .then(async (dataAttachments) => {
            console.log('sending alert to sasi with ' + dataAttachments);
            return await send_sasi_api(session, dataAttachments);
        })
        .catch(console.error);

    async function getImagesBlob([key, urls]) {
        const blobs = (await Promise.allSettled(urls.map(getImageBlob)))
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
        return { key, blobs };
    };

    async function getImageBlob(url) {
        try {
            const response = await fetch(url, { method: "GET" });
            return await response.blob();
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async function send_image(fd, session) {
        let url = "https://webclient.sasi.com.br/v2/messages/attachment";
        if (session) {
            url += `?session=${session}`;
        }

        const response = await fetch(url, {
            method: "POST",
            body: fd,
            headers: {
                Authorization: data_obj.token,
            },
        });

        if (response.status < 200 || response.status >= 300) {
            throw new Error("HTTP Error: " + response.status);
        }

        const { data } = await response.json();
        return data
    }

    async function send_sasi_api(idSession = "", dataAttachments = {}) {
        const res_sasi = await fetch("https://webclient.sasi.com.br/v2/messages", {
            method: "POST",
            body: JSON.stringify({
                text: data_obj.title,
                test: data_obj.test,
                uuid: idSession,
                anonymous: data_obj.anonymous,
                priority: 1,
                channelId: data_obj.channel,
                data: data_obj.data,
                dataComments: {},
                dataAttachments,
            }),
            headers: {
                "Content-Type": "application/json",
                Authorization: data_obj.token,
            },
        })
            .then(response => response.json())
            .catch(console.error);

        return res_sasi
    }

    return resultResponse
}

module.exports = sendSasi

