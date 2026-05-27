package com.DiskRisk.demo.repository;

import com.DiskRisk.demo.model.Denuncia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DenunciaRepository extends JpaRepository<Denuncia, Integer> {
    List<Denuncia> findByUsuarioId(Integer usuarioId);
    List<Denuncia> findByCep(String cep);
    List<Denuncia> findByNivelRisco(String nivelRisco);
    List<Denuncia> findByStatusDenuncia(String statusDenuncia);
}
