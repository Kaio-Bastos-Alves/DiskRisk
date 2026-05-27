package com.DiskRisk.demo.controller;

import com.DiskRisk.demo.model.Instituicao;
import com.DiskRisk.demo.model.Usuario;
import com.DiskRisk.demo.service.InstituicaoService;
import com.DiskRisk.demo.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final InstituicaoService instituicaoService;

    public AuthController(UsuarioService usuarioService, InstituicaoService instituicaoService) {
        this.usuarioService = usuarioService;
        this.instituicaoService = instituicaoService;
    }

    @PostMapping("/login/morador")
    public ResponseEntity<?> loginMorador(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("senha");

        Optional<Usuario> opt = usuarioService.buscarPorEmail(email);
        if (opt.isEmpty() || !opt.get().getSenha().equals(senha)) {
            return ResponseEntity.status(401).body(Map.of("erro", "Email ou senha inválidos."));
        }
        Usuario u = opt.get();
        Map<String, Object> resp = new HashMap<>();
        resp.put("tipo", "morador");
        resp.put("id", u.getId());
        resp.put("nome", u.getNome());
        resp.put("email", u.getEmail());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/login/instituicao")
    public ResponseEntity<?> loginInstituicao(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String senha = body.get("senha");

        Optional<Instituicao> opt = instituicaoService.buscarPorEmail(email);
        if (opt.isEmpty() || !opt.get().getSenha().equals(senha)) {
            return ResponseEntity.status(401).body(Map.of("erro", "Email ou senha inválidos."));
        }
        Instituicao i = opt.get();
        Map<String, Object> resp = new HashMap<>();
        resp.put("tipo", "instituicao");
        resp.put("id", i.getId());
        resp.put("nome", i.getNome());
        resp.put("email", i.getEmail());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/cadastro/morador")
    public ResponseEntity<?> cadastroMorador(@Valid @RequestBody Usuario usuario) {
        try {
            Usuario criado = usuarioService.criar(usuario);
            Map<String, Object> resp = new HashMap<>();
            resp.put("tipo", "morador");
            resp.put("id", criado.getId());
            resp.put("nome", criado.getNome());
            resp.put("email", criado.getEmail());
            return ResponseEntity.status(201).body(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/cadastro/instituicao")
    public ResponseEntity<?> cadastroInstituicao(@Valid @RequestBody Instituicao instituicao) {
        try {
            Instituicao criada = instituicaoService.criar(instituicao);
            Map<String, Object> resp = new HashMap<>();
            resp.put("tipo", "instituicao");
            resp.put("id", criada.getId());
            resp.put("nome", criada.getNome());
            resp.put("email", criada.getEmail());
            return ResponseEntity.status(201).body(resp);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}
