package com.DiskRisk.demo.service;

import com.DiskRisk.demo.model.Instituicao;
import com.DiskRisk.demo.repository.InstituicaoRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InstituicaoService {

    private final InstituicaoRepository repository;

    public InstituicaoService(InstituicaoRepository repository) {
        this.repository = repository;
    }

    public List<Instituicao> listarTodas() {
        return repository.findAll();
    }

    public Optional<Instituicao> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Optional<Instituicao> buscarPorEmail(String email) {
        return repository.findByEmail(email);
    }

    public Instituicao criar(Instituicao instituicao) {
        if (repository.existsByEmail(instituicao.getEmail()))
            throw new RuntimeException("E-mail já cadastrado.");
        if (instituicao.getCpf() != null && repository.existsByCpf(instituicao.getCpf()))
            throw new RuntimeException("CPF já cadastrado.");
        return repository.save(instituicao);
    }

    public Instituicao atualizar(Integer id, Instituicao dados) {
        Instituicao instituicao = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Instituição não encontrada."));
        instituicao.setNome(dados.getNome());
        instituicao.setEmail(dados.getEmail());
        instituicao.setSenha(dados.getSenha());
        instituicao.setCep(dados.getCep());
        instituicao.setCpf(dados.getCpf());
        instituicao.setFotoPerfil(dados.getFotoPerfil());
        return repository.save(instituicao);
    }

    public void deletar(Integer id) {
        if (!repository.existsById(id))
            throw new RuntimeException("Instituição não encontrada.");
        repository.deleteById(id);
    }
}
