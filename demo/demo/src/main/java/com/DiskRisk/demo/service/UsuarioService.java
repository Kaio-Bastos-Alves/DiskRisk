package com.DiskRisk.demo.service;

import com.DiskRisk.demo.model.Usuario;
import com.DiskRisk.demo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public List<Usuario> listarTodos() {
        return repository.findAll();
    }

    public Optional<Usuario> buscarPorId(Integer id) {
        return repository.findById(id);
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return repository.findByEmail(email);
    }

    public Usuario criar(Usuario usuario) {
        if (repository.existsByEmail(usuario.getEmail()))
            throw new RuntimeException("E-mail já cadastrado.");
        if (usuario.getCpf() != null && repository.existsByCpf(usuario.getCpf()))
            throw new RuntimeException("CPF já cadastrado.");
        return repository.save(usuario);
    }

    public Usuario atualizar(Integer id, Usuario dados) {
        Usuario usuario = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        usuario.setNome(dados.getNome());
        usuario.setEmail(dados.getEmail());
        usuario.setSenha(dados.getSenha());
        usuario.setCep(dados.getCep());
        usuario.setCpf(dados.getCpf());
        usuario.setFotoPerfil(dados.getFotoPerfil());
        return repository.save(usuario);
    }

    public void deletar(Integer id) {
        if (!repository.existsById(id))
            throw new RuntimeException("Usuário não encontrado.");
        repository.deleteById(id);
    }
}
