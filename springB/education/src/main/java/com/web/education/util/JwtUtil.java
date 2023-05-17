package com.web.education.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.*;
import com.web.education.pojo.User;

import java.time.Instant;
import java.util.Calendar;
import java.util.Date;

public class JwtUtil {

    private static final String SECRET = "!Q@W#E$R^Y&U";
    //token签发者
    private static final String ISSUSRE = "JOSH";
    //token过期时间
    public static final Long EXPIRE_DATE = 24*60*60L;


    public static String createToken(String username){
        //当前时间
        Date now = new Date();
        //1. header
        Algorithm algorithm = Algorithm.HMAC256(SECRET);
        String token = JWT.create()
                .withIssuer(ISSUSRE)
                .withIssuedAt(now)
                .withExpiresAt(new Date(now.getTime() + EXPIRE_DATE))
                .withClaim("username", username)
                .sign(algorithm);

        return token;
    }

    public static int verifyToken(String token, String username){
        Algorithm algorithm = Algorithm.HMAC256(SECRET);
        try {
            JWTVerifier jwtVerifier = JWT.require(algorithm).withClaim("username", username).build();
            jwtVerifier.verify(token);
            return 200;
        }catch (JWTVerificationException e) {
            return 400;
        }
//        catch (SignatureVerificationException e) {
//            //验证的签名不一致
//            throw new SignatureVerificationException(algorithm);
//        }catch (TokenExpiredException e){
//            throw new TokenExpiredException("token过期", Instant.now());
//        }catch (AlgorithmMismatchException e){
//            throw new AlgorithmMismatchException("签名算法不匹配");
//        }catch (InvalidClaimException e){
//            throw new InvalidClaimException("校验的claims内容不匹配");
//        }catch (Exception e){
//            e.printStackTrace();
//        }
//        JWTVerificationException e
    }

}
