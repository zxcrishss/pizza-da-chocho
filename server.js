const express = require("express");
const path = require("path");
require("dotenv").config();

const {
    MercadoPagoConfig,
    Preference
} = require("mercadopago");

const app = express();

app.use(express.json());

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

const accessToken =
    process.env.MERCADO_PAGO_ACCESS_TOKEN;

const publicKey =
    process.env.MERCADO_PAGO_PUBLIC_KEY;


if (!accessToken) {

    console.error(
        "ERRO: Access Token não configurado no arquivo .env"
    );

}


if (!publicKey) {

    console.error(
        "ERRO: Public Key não configurada no arquivo .env"
    );

}


const client =
    new MercadoPagoConfig({
        accessToken:
            accessToken
    });


app.get(
    "/teste",
    function(req, res) {

        res.json({
            mensagem:
                "Servidor funcionando corretamente."
        });

    }
);


app.get(
    "/config",
    function(req, res) {

        res.json({
            publicKey:
                publicKey
        });

    }
);


app.post(
    "/criar-preferencia",
    async function(req, res) {

        try {

            const produtos =
                req.body.produtos;


            if (
                !Array.isArray(produtos) ||
                produtos.length === 0
            ) {

                return res.status(400).json({
                    erro:
                        "O carrinho está vazio."
                });

            }


            const itens =
                produtos.map(
                    function(produto) {

                        return {
                            title:
                                String(produto.nome),

                            quantity:
                                Number(produto.quantidade) || 1,

                            unit_price:
                                Number(produto.preco),

                            currency_id:
                                "BRL"
                        };

                    }
                );


            console.log(
                "Itens enviados ao Mercado Pago:",
                itens
            );


            const preference =
                new Preference(client);


            const resultado =
                await preference.create({
                    body: {
                        items:
                            itens
                    }
                });


            console.log(
                "Preferência criada:",
                resultado.id
            );


            res.json({
                id:
                    resultado.id
            });


        } catch (erro) {

            console.error(
                "Erro do Mercado Pago:",
                erro
            );


            res.status(500).json({
                erro:
                    "Não foi possível criar a preferência de pagamento.",

                detalhes:
                    erro.message || String(erro)
            });

        }

    }
);


const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    function() {

        console.log("");

        console.log(
            `Servidor iniciado. Abra: http://localhost:${PORT}`
        );

        console.log("");

    }
);
