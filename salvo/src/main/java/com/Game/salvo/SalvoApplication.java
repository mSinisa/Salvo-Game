package com.Game.salvo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.authentication.configuration.GlobalAuthenticationConfigurerAdapter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.WebAttributes;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.util.Date;
import java.util.*;


@SpringBootApplication
public class SalvoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SalvoApplication.class, args);
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

	@Bean
	public CommandLineRunner initData(PlayerRepository playerRepository, GameRepository gameRepository,
									  GamePlayerRepository gamePlayerRepository, ShipRepository shipRepository,
									  SalvoRepository salvoRepository, ScoreRepository scoreRepository) {
		return (args) -> {
			//save few players
			Player p1= playerRepository.save(new Player("Jack Bauer", "24"));
			Player p2 = playerRepository.save(new Player("Chloe O'Brian","42" ));
			Player p3 = playerRepository.save(new Player("Kim Bauer", "kb"));
			Player p4 = playerRepository.save(new Player("Tony Almeida", "mole"));

			Game g1= new Game();
			Game g2= new Game();
			Game g3= new Game();
			g2.setDate(Date.from(g2.getDate().toInstant().plusSeconds(3600)));
			g3.setDate(Date.from(g3.getDate().toInstant().plusSeconds(7200)));

			gameRepository.save(g1);
			gameRepository.save(g2);
			gameRepository.save(g3);

			GamePlayer gp1 = new GamePlayer(p1, g1);
			GamePlayer gp2 = new GamePlayer(p2, g1);
			GamePlayer gp3 = new GamePlayer(p3, g2);
			GamePlayer gp4 = new GamePlayer(p4, g2);
			GamePlayer gp5 = new GamePlayer(p4, g3);
			GamePlayer gp6 = new GamePlayer(p3, g3);

			gamePlayerRepository.save(gp1);
			gamePlayerRepository.save(gp2);
			gamePlayerRepository.save(gp3);
			gamePlayerRepository.save(gp4);
			gamePlayerRepository.save(gp5);
			gamePlayerRepository.save(gp6);


			//carrier 5, battleship 4, submarine 3, destroyer 3, patrol boat 2;
			Ship sh1= new Ship("Carrier",  new ArrayList<>(Arrays.asList("A1", "A2", "A3", "A4", "A5")) );
			Ship sh6= new Ship("Carrier",  new ArrayList<>(Arrays.asList("J1", "J2", "J3", "J4", "J5")) );
			Ship sh11= new Ship("Carrier",  new ArrayList<>(Arrays.asList("I1", "I2", "I3", "I4", "I5")) );
			Ship sh16= new Ship("Carrier",  new ArrayList<>(Arrays.asList("A1", "A2", "A3", "A4", "A5")) );
			Ship sh21= new Ship("Carrier",  new ArrayList<>(Arrays.asList("A6", "B6", "C6", "D6", "E6")) );
			Ship sh26= new Ship("Carrier",  new ArrayList<>(Arrays.asList("I1", "I2", "I3", "I4", "I5")) );
			gp1.addShip(sh6);
			gp2.addShip(sh1);
			gp3.addShip(sh11);
			gp4.addShip(sh16);
			gp5.addShip(sh21);
			gp6.addShip(sh26);
			Ship sh2= new Ship("Battle Ship",  new ArrayList<>(Arrays.asList("B1", "B2", "B3", "B4")));
			Ship sh7= new Ship("Battle Ship",  new ArrayList<>(Arrays.asList("B1", "B2", "B3", "B4")));
			Ship sh12= new Ship("Battle Ship",  new ArrayList<>(Arrays.asList("B1", "B2", "B3", "B4")));
			Ship sh17= new Ship("Battle Ship",  new ArrayList<>(Arrays.asList("B1", "B2", "B3", "B4")));
			Ship sh22= new Ship("Battle Ship",  new ArrayList<>(Arrays.asList("J7", "J8", "J9", "J10")));
			Ship sh27= new Ship("Battle Ship",  new ArrayList<>(Arrays.asList("B1", "B2", "B3", "B4")));
			gp1.addShip(sh7);
			gp2.addShip(sh2);
			gp3.addShip(sh12);
			gp4.addShip(sh17);
			gp5.addShip(sh22);
			gp6.addShip(sh27);
			Ship sh3= new Ship("Submarine",  new ArrayList<>(Arrays.asList("C1", "C2", "C3")) );
			Ship sh8= new Ship("Submarine",  new ArrayList<>(Arrays.asList("E1", "E2", "E3")) );
			Ship sh13= new Ship("Submarine",  new ArrayList<>(Arrays.asList("F1", "F2", "F3")) );
			Ship sh18= new Ship("Submarine",  new ArrayList<>(Arrays.asList("C1", "C2", "C3")) );
			Ship sh23= new Ship("Submarine",  new ArrayList<>(Arrays.asList("C1", "C2", "C3")) );
			Ship sh28= new Ship("Submarine",  new ArrayList<>(Arrays.asList("F1", "F2", "F3")) );
			gp1.addShip(sh8);
			gp2.addShip(sh3);
			gp3.addShip(sh13);
			gp4.addShip(sh18);
			gp5.addShip(sh23);
			gp6.addShip(sh28);
			Ship sh4= new Ship("Destroyer",  new ArrayList<>(Arrays.asList("D7", "D8", "D9")) );
			Ship sh9= new Ship("Destroyer",  new ArrayList<>(Arrays.asList("G1", "G2", "G3")) );
			Ship sh14= new Ship("Destroyer",  new ArrayList<>(Arrays.asList("H8", "H9", "H10")) );
			Ship sh19= new Ship("Destroyer",  new ArrayList<>(Arrays.asList("D1", "D2", "D3")) );
			Ship sh24= new Ship("Destroyer",  new ArrayList<>(Arrays.asList("D1", "E1", "F1")) );
			Ship sh29= new Ship("Destroyer",  new ArrayList<>(Arrays.asList("D1", "D2", "D3")) );
			gp1.addShip(sh9);
			gp2.addShip(sh4);
			gp3.addShip(sh14);
			gp4.addShip(sh19);
			gp5.addShip(sh24);
			gp6.addShip(sh29);
			Ship sh5= new Ship("Patrol Boat",  new ArrayList<>(Arrays.asList("E1", "E2")));
			Ship sh10= new Ship("Patrol Boat",  new ArrayList<>(Arrays.asList("F1", "F2")));
			Ship sh15= new Ship("Patrol Boat",  new ArrayList<>(Arrays.asList("E1", "E2")));
			Ship sh20= new Ship("Patrol Boat",  new ArrayList<>(Arrays.asList("E1", "E2")));
			Ship sh25= new Ship("Patrol Boat",  new ArrayList<>(Arrays.asList("E3", "E4")));
			Ship sh30= new Ship("Patrol Boat",  new ArrayList<>(Arrays.asList("E1", "E2")));
			gp1.addShip(sh10);
			gp2.addShip(sh5);
			gp3.addShip(sh15);
			gp4.addShip(sh20);
			gp5.addShip(sh25);
			gp6.addShip(sh30);



			shipRepository.save(sh1);
			shipRepository.save(sh2);
			shipRepository.save(sh3);
			shipRepository.save(sh4);
			shipRepository.save(sh5);
			shipRepository.save(sh6);
			shipRepository.save(sh7);
			shipRepository.save(sh8);
			shipRepository.save(sh9);
			shipRepository.save(sh10);
			shipRepository.save(sh11);
			shipRepository.save(sh12);
			shipRepository.save(sh13);
			shipRepository.save(sh14);
			shipRepository.save(sh15);
			shipRepository.save(sh16);
			shipRepository.save(sh17);
			shipRepository.save(sh18);
			shipRepository.save(sh19);
			shipRepository.save(sh20);

			Salvo slv1= new Salvo(1, new ArrayList<>(Arrays.asList("D7", "D8", "D9")));
			gp1.addSalvo(slv1);
			Salvo slv2= new Salvo(1, new ArrayList<>(Arrays.asList("A2", "B3", "C4")));
			gp2.addSalvo(slv2);
			Salvo slv3= new Salvo(2, new ArrayList<>(Arrays.asList("J10", "G7", "D4")));
			gp1.addSalvo(slv3);
			Salvo slv4= new Salvo(2, new ArrayList<>(Arrays.asList("I2", "J3", "J4")));
			gp2.addSalvo(slv4);
			Salvo slv5= new Salvo(3, new ArrayList<>(Arrays.asList("G6", "G4", "I4")));
			gp1.addSalvo(slv5);
			Salvo slv6= new Salvo(3, new ArrayList<>(Arrays.asList("A7", "B5", "C1")));
			gp2.addSalvo(slv6);
			Salvo slv7= new Salvo(4, new ArrayList<>(Arrays.asList("F2", "F5", "F10")));
			gp1.addSalvo(slv7);
			Salvo slv8= new Salvo(4, new ArrayList<>(Arrays.asList("E2", "E3", "E4")));
			gp2.addSalvo(slv8);
			Salvo slv9= new Salvo(5, new ArrayList<>(Arrays.asList("A9", "B8", "C7")));
			gp1.addSalvo(slv9);
			Salvo slv10= new Salvo(5, new ArrayList<>(Arrays.asList("A10", "B10", "C10")));
			gp2.addSalvo(slv10);
			Salvo slv11= new Salvo(1, new ArrayList<>(Arrays.asList("A10", "B10", "C10")));
			gp3.addSalvo(slv11);
			Salvo slv12= new Salvo(1, new ArrayList<>(Arrays.asList("A10", "B10", "C10")));
			gp4.addSalvo(slv12);
			Salvo slv13= new Salvo(2, new ArrayList<>(Arrays.asList("J10", "A1", "B3")));
			gp3.addSalvo(slv13);
			Salvo slv14= new Salvo(2, new ArrayList<>(Arrays.asList("A4", "F1", "C2")));
			gp4.addSalvo(slv14);

			salvoRepository.save(slv1);
			salvoRepository.save(slv2);
			salvoRepository.save(slv3);
			salvoRepository.save(slv4);
			salvoRepository.save(slv5);
			salvoRepository.save(slv6);
			salvoRepository.save(slv7);
			salvoRepository.save(slv8);
			salvoRepository.save(slv9);
			salvoRepository.save(slv10);
			salvoRepository.save(slv11);
			salvoRepository.save(slv12);
			salvoRepository.save(slv13);
			salvoRepository.save(slv14);

			Score scr1= new Score(0.5, g1, p1);
			Score scr2= new Score(0.5, g1, p2);
			Score scr3= new Score(1.0, g2, p3);
			Score scr4= new Score(0.0, g2, p2);


			scoreRepository.save(scr1);
			scoreRepository.save(scr2);
			scoreRepository.save(scr3);
			scoreRepository.save(scr4);

		};
	}

}

@Configuration
class WebSecurityConfiguration extends GlobalAuthenticationConfigurerAdapter {

	@Autowired
	private PlayerRepository playerRepo;

	@Override
	public void init(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userDetailsService());
	}

	@Bean
	UserDetailsService userDetailsService() {
		return new UserDetailsService() {

			@Bean
			public PasswordEncoder passwordEncoder() {
				return PasswordEncoderFactories.createDelegatingPasswordEncoder();
			}

			@Override
			public UserDetails loadUserByUsername(String name) throws UsernameNotFoundException {
				Player people = playerRepo.findByUserName(name);
				if (people != null) {
					Player player = people;
					return User.withUsername(player.getUserName()).password(passwordEncoder().encode(player.getPassword())).roles("USER").build();
				} else {
					throw new UsernameNotFoundException("Unknown user: " + name);
				}
			}
		};
	}
}

@Configuration
@EnableWebSecurity
class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	@Override
	protected void configure(HttpSecurity http) throws Exception {

		http.authorizeRequests()
				.antMatchers("/web/games.html").permitAll()
				.antMatchers("/api/games").permitAll()
				.antMatchers("/api/players").permitAll()
				.antMatchers("/web/games.js").permitAll()
				.antMatchers("/web/games.css").permitAll()
				.antMatchers("/web/images/**").permitAll()
				.antMatchers("/rest/**").permitAll()
				.anyRequest().authenticated()
				.and()
				.formLogin()
				.usernameParameter("username")
				.passwordParameter("password")
				.loginPage("/api/login")
				.and()
				.logout()
				.logoutUrl("/api/logout");



		// turn off checking for CSRF tokens
		http.csrf().disable();

		// if user is not authenticated, just send an authentication failure response
		http.exceptionHandling().authenticationEntryPoint((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if login is successful, just clear the flags asking for authentication
		http.formLogin().successHandler((req, res, auth) -> clearAuthenticationAttributes(req));

		// if login fails, just send an authentication failure response
		http.formLogin().failureHandler((req, res, exc) -> res.sendError(HttpServletResponse.SC_UNAUTHORIZED));

		// if logout is successful, just send a success response
		http.logout().logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler());

		//Disbale X-Frame
		http.headers().frameOptions().disable();

	}

	private void clearAuthenticationAttributes(HttpServletRequest request) {
		HttpSession session = request.getSession(false);
		if (session != null) {
			session.removeAttribute(WebAttributes.AUTHENTICATION_EXCEPTION);
		}
	}
}


