package com.DiskRisk.demo.controller;

import com.DiskRisk.demo.model.Denuncia;
import com.DiskRisk.demo.service.DenunciaService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.validation.BindingResult;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/denuncias")
public class DenunciaController {

    private final DenunciaService service;
    private static final Logger logger = LoggerFactory.getLogger(DenunciaController.class);

    public DenunciaController(DenunciaService service) {
        this.service = service;
    }

    @GetMapping
    public List<Denuncia> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Denuncia> buscarPorId(@PathVariable Integer id) {
        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public List<Denuncia> buscarPorUsuario(@PathVariable Integer usuarioId) {
        return service.buscarPorUsuario(usuarioId);
    }

    @GetMapping("/cep/{cep}")
    public List<Denuncia> buscarPorCep(@PathVariable String cep) {
        return service.buscarPorCep(cep);
    }

    @GetMapping("/risco/{nivelRisco}")
    public List<Denuncia> buscarPorNivelRisco(@PathVariable String nivelRisco) {
        return service.buscarPorNivelRisco(nivelRisco);
    }

    @GetMapping("/status/{status}")
    public List<Denuncia> buscarPorStatus(@PathVariable String status) {
        return service.buscarPorStatus(status);
    }

    @PostMapping
    public ResponseEntity<?> criar(@Valid @RequestBody Denuncia denuncia, BindingResult br) {
        // Se houver erros de validação dos campos (@NotBlank, @Size, @NotNull, etc) devolve detalhes
        if (br.hasErrors()) {
            String msg = br.getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
            logger.warn("Validação inválida ao criar denúncia: {}", msg);
            return ResponseEntity.badRequest().body(msg);
        }

        // Log do payload recebido para ajudar debug (confirme que usuarioId está correto)
        logger.info("Recebendo requisição criar denúncia: {}", denuncia);
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(denuncia));
        } catch (RuntimeException e) {
            logger.warn("Erro ao criar denúncia: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> atualizarStatus(@PathVariable Integer id, @RequestBody java.util.Map<String, String> body) {
        try {
            return ResponseEntity.ok(service.atualizarStatus(id, body.get("status")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> atualizar(@PathVariable Integer id, @Valid @RequestBody Denuncia denuncia) {
        try {
            return ResponseEntity.ok(service.atualizar(id, denuncia));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletar(@PathVariable Integer id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
