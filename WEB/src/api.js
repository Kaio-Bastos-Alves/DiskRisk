const BASE = "http://localhost:8080";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data.erro ||
      data.message ||
      (Array.isArray(data.errors) ? data.errors.map((e) => e.defaultMessage).join(", ") : null) ||
      "Erro na requisição";
    throw new Error(msg);
  }
  return data;
}

function limpar(dados) {
  const d = { ...dados };
  if (!d.cpf || d.cpf.trim() === "") delete d.cpf;
  return d;
}

export const api = {
  // Auth
  loginMorador: (email, senha) =>
    request("/auth/login/morador", { method: "POST", body: JSON.stringify({ email, senha }) }),
  loginInstituicao: (email, senha) =>
    request("/auth/login/instituicao", { method: "POST", body: JSON.stringify({ email, senha }) }),
  cadastroMorador: (dados) =>
    request("/auth/cadastro/morador", { method: "POST", body: JSON.stringify(limpar(dados)) }),
  cadastroInstituicao: (dados) =>
    request("/auth/cadastro/instituicao", { method: "POST", body: JSON.stringify(limpar(dados)) }),

  // Perfil
  atualizarMorador: (id, dados) =>
    request(`/usuarios/${id}`, { method: "PUT", body: JSON.stringify(limpar(dados)) }),
  atualizarInstituicao: (id, dados) =>
    request(`/instituicoes/${id}`, { method: "PUT", body: JSON.stringify(limpar(dados)) }),

  // Denúncias
  listarDenuncias: () => request("/denuncias"),
  buscarDenuncia: (id) => request(`/denuncias/${id}`),
  criarDenuncia: (dados) =>
    request("/denuncias", { method: "POST", body: JSON.stringify(dados) }),
  atualizarStatus: (id, status) =>
    request(`/denuncias/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
