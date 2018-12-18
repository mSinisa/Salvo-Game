package com.Game.salvo;

import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource

public interface GameRepository extends JpaRepository<Game, Long> {

}
