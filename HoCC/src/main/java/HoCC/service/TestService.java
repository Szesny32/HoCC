package HoCC.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

@Service
public class TestService {
    public String getTestString(){
        return LocalDate.now().toString() + " " + LocalTime.now();
    }
}
