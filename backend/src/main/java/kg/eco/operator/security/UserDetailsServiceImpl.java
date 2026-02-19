package kg.eco.operator.security;

import kg.eco.operator.entity.User;
import kg.eco.operator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String inn) throws UsernameNotFoundException {
        User user = userRepository.findByInn(inn)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Пользователь с ИНН " + inn + " не найден"));

        return new org.springframework.security.core.userdetails.User(
                user.getInn(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
